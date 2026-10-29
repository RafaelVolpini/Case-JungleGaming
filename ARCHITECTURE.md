# Arquitetura — Kurio NFT Marketplace

> Decisões de arquitetura, contratos REST e eventos, política de sessão, estado do carrinho, estratégia de cache,
> reconciliação REST ↔ Socket.IO, decisões de UX, desvios do Figma, limitações e como a solução é verificada.
> Setup, comandos, credenciais, cenários, Playwright e Lighthouse estão no [README](README.md).

## Sumário

1. [Stack](#1-stack)
2. [Tempo real: Socket.IO sobre MSW](#2-tempo-real-socketio-sobre-msw)
3. [Verificação](#3-verificação)
4. [Desvios do Figma e decisões de UX](#4-desvios-do-figma)
5. [Camada de mocks](#5-camada-de-mocks)
6. [Fixtures](#6-fixtures)
7. [Decisões de código](#7-decisões-de-código)
8. [Estado, cache e sincronização](#8-estado-cache-e-sincronização)
9. [Tempo real no cliente e reconciliação](#9-tempo-real-no-cliente)
10. [Sessão, carrinho e pedido](#10-sessão-carrinho-e-pedido)
11. [Layout responsivo](#11-layout-responsivo)
12. [Acessibilidade](#12-acessibilidade)
13. [Performance e auditoria](#13-performance-e-auditoria)
14. [Testes](#14-testes)
15. [Limitações assumidas](#15-limitações-assumidas)
16. [Contratos REST e eventos](#16-contratos-rest-e-eventos)

## 1. Stack

| Responsabilidade | Escolha | Observação |
| --- | --- | --- |
| Build | Vite 8 | Alvo de deploy: Vercel |
| Interface | React 19.3 | |
| Linguagem | TypeScript 5.9 | `strict` + `noUncheckedIndexedAccess` |
| Roteamento | TanStack Router | File-based, `autoCodeSplitting` |
| Estado remoto | TanStack Query v5 | |
| HTTP | Axios | |
| Tempo real | socket.io-client 4.8 | |
| Estilização | Tailwind CSS v4 | Tokens CSS-first em `@theme` |
| Componentes | shadcn/ui | |
| Mocking | **MSW 2.15** + `@mswjs/socket.io-binding` 0.2 | Ver §2.1 |
| E2E | Playwright | |

### 1.1 Por que TypeScript 5.9 e não 7.0

O template atual do Vite entrega TypeScript 7 (port nativo). TanStack Router e
Zod estão entre as bibliotecas com inferência de tipos mais pesada do
ecossistema, e um desvio de inferência no meio do projeto custaria mais do que o
ganho de tempo de compilação. A migração é um número no `package.json`.

## 2. Tempo real: Socket.IO sobre MSW

A camada de mocks e a de tempo real compartilham o mesmo transporte: o cliente
é um `socket.io-client` real e os eventos atravessam um servidor Socket.IO
simulado dentro do MSW, via `@mswjs/socket.io-binding`.

### 2.1 Restrição de versão

`@mswjs/socket.io-binding@0.2.0` declara `peerDependencies: { msw: "^2.10.2" }`.
**O MSW está fixado na linha 2.x** por causa disso, embora a v3 já seja o
`latest`. Atualizar o MSW para a v3 quebra o tempo real.

### 2.2 Três restrições do transporte

Descobertas no spike e documentadas aqui porque nenhuma é óbvia no código.

**a) O cliente precisa falar só WebSocket.**
O MSW intercepta WebSocket, nunca HTTP long-polling. Como o `socket.io-client`
usa `['polling', 'websocket']` por padrão e começa no polling, o handshake
jamais chegaria ao MSW. Daí `transports: ['websocket']` em
`src/lib/realtime/socket.ts`.

**b) A barra final do path quebra o matching.**
O `WebSocketHandler#resolveWebSocketUrl` do MSW remove a barra final do padrão
registrado (`/socket.io/` vira `/socket.io`), mas compara contra a URL do
cliente com `getCleanUrl`, que preserva o `pathname` como está. O Engine.IO
acrescenta `/` ao path por padrão, produzindo `/socket.io/` — que nunca é igual
ao padrão normalizado. Daí `addTrailingSlash: false` no cliente.

**c) A ordem de carregamento dos módulos importa.**
`engine.io-client/transports/websocket.js` captura
`const WebSocketCtor = globalThis.WebSocket` **no escopo do módulo**. O MSW
substitui esse global dentro de `worker.start()`. Portanto, se qualquer módulo
avaliado antes do `start()` importar `socket.io-client`, o cliente guarda o
`WebSocket` original e a conexão passa direto, sem interceptação e sem erro
visível — só um socket que nunca conecta.

Duas consequências de projeto:

1. `src/mocks/**` **não pode importar `socket.io-client`**. A constante
   compartilhada do path vive em `src/lib/realtime/constants.ts`, que não tem
   esse import.
2. O `main.tsx` aguarda `enableMocking()` antes de renderizar. Como as rotas
   são code-split, nenhum componente é avaliado antes disso.

### 2.3 Heartbeat do Engine.IO

No Engine.IO v4 o heartbeat é dirigido pelo servidor: ele envia `PING` ("2") e
o cliente responde `PONG` ("3"). O `@mswjs/socket.io-binding@0.2.0` completa o
handshake anunciando `pingInterval: 25000, pingTimeout: 5000`, mas **nunca
envia o ping**, e descarta todo pacote Engine.IO que não seja `message`.

Resultado medido no spike, com o heartbeat desligado:

```
000s  connect — id=test transport=websocket
030s  disconnect — ping timeout
032s  connect — id=test transport=websocket
```

O cliente se derruba sozinho em exatamente `pingInterval + pingTimeout` = 30s e
entra em ciclo de reconexão a cada 30s. Como o desafio exige reconexão,
reconciliação e pedido pendente sobrevivendo a quedas, um socket que pisca a
cada 30s contaminaria todos esses cenários.

**Solução:** o gateway envia o `PING` por conta própria a cada 20s
(`HEARTBEAT_INTERVAL_MS` em `src/mocks/socket/gateway.ts`) e limpa o timer no
`close`. Com o heartbeat ligado o spike passou de 76s sem nenhuma desconexão.

A opção `heartbeat: false` fica exposta de propósito: é o gancho para os testes
E2E reproduzirem queda de conexão sem precisar derrubar o servidor.

### 2.4 Limitações assumidas

- Sem namespaces, rooms ou broadcasting — o binding não os implementa. Como a
  aplicação é single-tenant por aba, não há necessidade.
- O `sid` do handshake é fixo (`"test"`), codificado no binding. O isolamento
  por usuário é feito na camada de aplicação, não pelo `sid`.
- Só o transporte WebSocket existe no ambiente de mocks; não há upgrade a
  partir de polling para exercitar.

## 3. Verificação

O transporte Socket.IO sobre MSW é exercitado pelos testes E2E de tempo real (§14), que passam pelo cliente
`socket.io-client` real. O parâmetro `?heartbeat=0` desliga o ping do servidor simulado e reproduz o *ping timeout*
descrito em §2.3.

## 4. Desvios do Figma

| Item | Desvio | Motivo |
| --- | --- | --- |
| Cor de erro | Adicionado `#E2574C` | O Figma só usa o laranja primário no asterisco de campo obrigatório; não há cor de erro de validação |
| Cor de sucesso | Adicionado `#5C9E6B` | Necessária para pedido confirmado; ausente no Figma |
| Hover de botão | Adicionado `#C07A3C` | Ausente no Figma |
| Surface elevada | Adicionado `#2F1D17` | Para estados de hover/accent do shadcn |
| Fonte | Roboto Mono em vez de Space Mono | A spec gerada a partir dos screenshots indica Space Mono, mas os glifos do Figma (`r` sem pé, `M` com vértice na metade da altura, `c` de terminais retos) correspondem a Roboto Mono; confirmado renderizando as candidatas ao lado do recorte em resolução original |
| Container | 1200 px centralizado | A spec fala em padding lateral de 80 px; a medição dos screenshots (2880 px) mostra o conteúdo começando em x=120 em um viewport de 1440 |
| Separador decimal | Ponto em todos os valores | O Figma alterna entre `1.19 ETH` nos cards e `0,02 - 12,30 ETH` no filtro. ETH é escrito com ponto mundialmente; usar vírgula só no filtro seria inconsistência replicada |

Todos mantêm a família de matiz da paleta e estão definidos como tokens em `src/app/styles/globals.css`.

### 4.1 Assets de NFT

As artes de primata do Figma não acompanham o arquivo exportado, mas três delas foram fornecidas
(macaco dourado de fones, macaco escuro de blazer, macaco marrom de óculos). O quarto personagem
que domina o catálogo do layout, o gorila cinza de chapéu e moletom roxo, não veio como arquivo e
foi recortado do screenshot em resolução original (476 px, recorte com margem para evitar os
cantos arredondados do card).

Os quatro originais ficam em `assets/nft-source/` e `npm run art` gera as variantes otimizadas em
`public/nft/` (`{arte}-{160,240,320,480,720,960}.webp`, de 3 a 56 KB cada, contra 140 a 188 KB dos
originais). Cada slot da interface declara um `sizes` exato (`lib/format/image.ts`), então o navegador baixa a menor
variante que cobre o tamanho real em pixels do dispositivo (um card mobile de 155 px em tela 2x recebe 320 px, não 960).
`npm run art:check` é o portão de qualidade: para cada arte, slot e densidade (1x e 2x) a variante escolhida precisa ter
SSIM de pelo menos 0,97 contra o original no tamanho do slot e não perder mais de 0,016 de SSIM frente à escada anterior
(480/960 em WebP q80). As mesmas quatro artes são servidas a todos os usuários, sem miniaturas nem placeholders. Há quatro
personagens para 239 NFTs, então as artes se repetem entre itens: é a mesma repetição que o próprio Figma faz.

O Sage tem origem de 476 px e é ampliado para 960 px, ficando mais suave no detalhe do que os
outros três. Para trocar por uma arte nativa basta substituir `assets/nft-source/sage.webp`.

### 4.2 Outros desvios e decisões de UX

| Item | Decisão |
| --- | --- |
| Pagamento no mobile | O frame mobile ("Pagamento com carteira") não tem formulário de colecionador; o pedido usa os dados do perfil e da carteira. Os provedores (WalletConnect, MetaMask, Coinbase) alteram o tipo da carteira selecionada |
| Pagamento no desktop | Lista as carteiras cadastradas (o Figma mostra três cartões estáticos) e um cartão que leva ao cadastro de carteiras |
| Campos preenchidos | Formulários mostram os dados do usuário; o Figma mostra campos vazios |
| Etiqueta RARO | No mobile aparece para NFT raro com preço anterior (único caso do frame); o desktop do Figma não mostra a etiqueta |
| Menu "Meu perfil" | "Lista de interesse" aponta para os favoritos reais; Atividade, Ofertas, Arquivos baixados e Suporte avisam que estão fora do escopo |
| "Apelido da carteira" no perfil | Edita o apelido da carteira principal |
| "ENS ou carteira secundária" | Persistido como `linkedReference` na carteira |
| Links "Aplique aqui" e "Crie uma conta" | Sem sublinhado por padrão (como no Figma), sublinham no hover e no foco |
| Modal de acesso no desktop | Sem escurecer o fundo, como no Figma; clicar fora ou `Esc` fecha |
| Descrição no detalhe mobile | Texto derivado (edição, coleção e rede), como no frame, em vez do texto longo do desktop |
| Edições | O frame mobile repete `1/10`; a interface mostra as edições reais (1/1, 1/10, 1/50, ABERTA) |
| Cabeçalho ativo | `Início` em início, acesso e perfil; `Mercado` em detalhe, carrinho, pagamento e pedido (como nos frames) |
| Tablet | O Figma não tem frame de tablet; usa-se o layout mobile em coluna de 640 px (§11) |
| Modais no desktop | Sempre no tamanho do Figma (acesso 500 px; recibo 578 px de largura, altura conforme o conteúdo, 821 px com 3 itens). Ficam centralizados na vertical quando cabem e, em janelas mais baixas, a própria sobreposição rola (24 px de respiro em cima e embaixo), sem escala e sem corte. O Figma posiciona o recibo a 166 px do topo de um quadro de 1657 px; aqui a posição é derivada da janela. Clicar fora e `Esc` fecham; trocar entre login e cadastro volta ao topo (`scrollToTopSelectors`) |
| Cadastro | O modal de acesso ganhou o convite "Novo na Kurio? Crie uma conta" / "Já tem uma conta? Entre" (o Figma só tem as abas), igual ao frame mobile |
| Destaque da home | Ponto ativo em cor cheia com halo e os demais a 55%; o destaque avança sozinho a cada 5 s, pausa com o ponteiro sobre a imagem, com foco por teclado e com a aba oculta, e não avança com "reduzir movimento" |
| Abas e menus no mobile | Nunca rolam para o lado: abas e menu do perfil quebram linha; as abas da home reduzem a fonte (até ~11 px em 320 px) e usam 6 px entre si; "Avaliações de colecionadores" vira "Avaliações" abaixo de 768 px |
| Barra inferior (mobile) | Ícones afastados (Figma: 72 e 62,5 px; aqui até 84 px, encolhendo em telas estreitas para nunca passar da largura) e gradiente de 45% (filtro) e 40% (scan) até a cor cheia, como no frame. O botão central de escanear fica acima dos links para responder em toda a área |
| Grade do catálogo no mobile | **Desvio pedido pelo produto:** duas colunas alinhadas, com as imagens na mesma linha. O frame do Figma escalona a coluna direita; o alinhamento facilita a leitura e a paginação |
| Abas do catálogo | "Todos os NFTs", "Novos lançamentos" e "Em alta" têm espaçamento uniforme entre si e mostram conjuntos de itens diferentes (§7.2) |
| Quantidade (−/+) | Com 1 unidade o "−" fica bloqueado de forma visível (fundo apagado, anel, cursor proibido, dica "Quantidade mínima: 1") e continua focável (`aria-disabled`); tocar nele explica o limite. O Figma só mostra o estado ativo. No "+" o limite informa "Só restam N" ou "O limite é de N por pedido" |
| Filtros ativos | Busca, coleções, redes, raridade e faixa de preço aparecem como chips removíveis com "Limpar filtros", no desktop e no mobile. Não existem no Figma; tornam o estado da URL visível |
| Revisão no mobile | O frame mobile de pagamento só mostra o total. O diálogo de confirmação lista itens, taxa de rede, desconto e total antes do envio, porque o enunciado exige revisão |
| Avatar | O perfil oferece um seletor de avatares (emoji) em vez de upload de imagem; o contrato de perfil guarda o emoji escolhido (`avatarEmoji`) |
| Pedidos | Não há tela de histórico de pedidos (fora do Figma); o recibo é acessado pelo link do pedido, pelo aviso de confirmação ou pelo retorno do checkout |
| Título e foco por rota | Cada rota define o `<title>` (por exemplo "Carrinho · Kurio") e um anúncio educado para leitores de tela ao navegar |
| Destaque da home no mobile | Abaixo de 390 px o banner escala proporcionalmente (todas as medidas do frame viram frações da largura), em vez de sobrepor texto e imagem |
| Simulador de mercado | Painel de desenvolvimento/demonstração, oculto por padrão (`?simulador=1` ou `Ctrl+Alt+M`); não aparece no Figma e não altera nenhuma tela quando fechado (§5.4) |

## 5. Camada de mocks

### 5.1 Base simulada

`src/mocks/db` guarda registros internos que **não** são as formas da API: o
servidor é dono de hash de senha, propriedade e referências cruas, e os
handlers projetam isso nos contratos na saída.

A consequência mais importante desse corte está no carrinho. Uma linha guarda
apenas `nftId + editionId + quantity` — nunca o preço. Preço unitário,
subtotal e disponibilidade são lidos do NFT a cada projeção. Então um
`nft.updated` aparece no resumo do carrinho **sem nenhum código de
sincronização**, e é estruturalmente impossível o carrinho carregar um preço
que o catálogo não oferece mais.

Toda escrita passa por `mutate()`, que persiste e só então emite os eventos.
Nenhuma mutação consegue pular a persistência, e nenhum evento sai antes do
estado estar consistente.

### 5.2 REST e Socket.IO não têm como divergir

A base expõe um event bus (`onDbEvent`). O gateway assina esse bus e monta o
payload **lendo o mesmo store que os handlers REST leem**, em vez de usar o que
a mutação tinha em mãos. Não existe caminho em que um evento discorde da
resposta REST do mesmo recurso.

Eventos de catálogo vão para todos os clientes; eventos de pedido só para
sockets que se identificaram como o dono (`session.identify`). Esse é o lado
servidor do isolamento entre usuários — o cliente ainda confere `ownerId`.

### 5.3 Cenários de rede

Configuráveis por query string, por `POST /api/__mock__/scenario` ou por
`localStorage`. A query string vence, para que um link de demonstração ou um
teste Playwright fixe um cenário sem limpar storage de ninguém.

| Latência | Comportamento |
| --- | --- |
| `none` | 0 ms |
| `fast` | 120 ms (padrão) |
| `slow` | 1500 ms |
| `variable` | 100–2000 ms, gerador semeado |
| `out-of-order` | Requisições sucessivas resolvem **mais rápido** que as anteriores |

| Falha | Comportamento |
| --- | --- |
| `offline` | Falha de transporte (`TypeError`), não status HTTP |
| `server-error` | 500 com envelope `SERVER_ERROR` |
| `timeout` | Nunca resolve; quem encerra é o timeout do Axios |
| `intermittent` | Falha 1 a cada `failEvery` requisições |
| `unauthorized` | 401, para simular expiração no meio do fluxo |

`scope` restringe a falha a prefixos de caminho, então dá para derrubar só
`/api/cart` e manter o resto de pé.

**Nada aqui usa `Math.random`.** O enunciado pede cenários reproduzíveis, e uma
taxa de falha aleatória tornaria a suíte Playwright instável em vez de
determinística. Falhas intermitentes são contadas por requisição e a latência
variável vem de um gerador semeado. Medido: `intermittent` com `failEvery: 3`
produz exatamente `[200, 200, 500, 200, 200, 500]`, e `out-of-order` resolve
cinco requisições paralelas na ordem `[5, 4, 3, 2, 1]` — que é o que expõe
race condition na camada de query.

### 5.4 Controle da simulação

| Rota | Função |
| --- | --- |
| `POST /api/__mock__/reset` | Restaura o cenário semeado; o contador de versões nunca volta atrás |
| `GET\|POST /api/__mock__/scenario` | Lê ou ajusta as condições de rede |
| `POST /api/__mock__/expire-sessions` | Expira todas as sessões na hora |
| `GET /api/__mock__/state` | Snapshot para asserção nos testes |
| `GET /api/__mock__/ping` | Responde JSON enquanto o worker atende a aba; usado pelo guardião do worker (§5.6) |
| `POST /api/__mock__/nfts/:slug` | Altera preço ou disponibilidade; o evento `nft.updated` sai pelo bus. `previousPriceEth` só é preenchido quando o preço cai |
| `GET /api/__mock__/socket` | Quantidade de clientes Socket.IO conectados e milissegundos restantes de uma queda simulada |
| `POST /api/__mock__/socket/drop` | Derruba as conexões; com `{ holdMs }` recusa novas conexões durante a queda, para dar tempo de alterar dados offline |
| `POST /api/__mock__/socket/reconnect` | Encerra a queda e deixa o cliente reconectar |
| `POST /api/__mock__/socket/emit` | Entrega um evento arbitrário aos clientes (duplicados, versões antigas) |
| `POST /api/__mock__/socket/replay` | Reenvia o último evento do NFT (`duplicate`) ou o anterior a ele (`stale`) |

Essas rotas **não** passam pela simulação de rede, de propósito: é preciso
conseguir resetar a base ou desligar uma falha enquanto o cenário `offline`
está ativo, senão a única saída seria limpar o storage na mão.

**Simulador de mercado.** `features/market-simulator` é um painel (oculto por padrão; `?simulador=1` ou `Ctrl+Alt+M`) que
só chama essas rotas pelo cliente HTTP. A mudança de preço entra na base simulada, o bus emite `nft.updated`, o servidor
Socket.IO simulado entrega ao `socket.io-client` e só então o cache do app é atualizado: o painel nunca escreve no cache
nem chama setters, o que preserva a regra do enunciado de que eventos simulados passam pelo cliente Socket.IO. O módulo
é carregado sob demanda (só o atalho fica no caminho do app) e só existe com os mocks ligados (`lib/mocks-enabled.ts`).
No lado do servidor simulado, `socket/clients.ts` guarda as conexões, `socket/outage.ts` implementa a queda com retenção
e `socket/event-log.ts` lembra os dois últimos eventos de cada NFT para o replay.

`expire-sessions` existe porque esperar um TTL real deixaria o teste de
expiração lento e dependente de relógio — inclusive o caso de expirar no meio
do checkout.

### 5.5 Sessão

O token viaja como header `Authorization: Bearer`, não como cookie. O
tratamento de cookie do MSW difere entre o worker do browser e o Node, e um
header se comporta igual nos dois — o que importa porque os mesmos handlers
sustentam a suíte Playwright. Um backend de produção deveria usar cookie
`httpOnly`; é uma simplificação deliberada do ambiente simulado.

A sessão dura 30 minutos e não é deslizante; sessões vencidas são removidas na primeira leitura.
Senhas são guardadas como SHA-256 com salt por usuário e nunca voltam na
resposta, nem para a própria conta. Login responde igual para conta
inexistente e senha errada, para não transformar o formulário em um oráculo de
contas.

### 5.6 Worker do MSW encerrado pelo navegador

O MSW responde pela rede através de um service worker. O worker guarda em memória a lista de abas "ativas"
(`activeClientIds`) e, quando o navegador o encerra por inatividade (abas em segundo plano ou ociosas), essa lista se
perde: ao acordar, o worker deixa **todas** as chamadas passarem direto para o servidor estático. No Vite (e na Vercel,
por causa da reescrita para `index.html`) um `GET /api/nfts` passa a devolver o HTML da aplicação com status 200.

O sintoma era o catálogo exibir "Não foi possível carregar o catálogo — Algo deu errado" ao filtrar: dados já em cache
continuavam na tela, mas qualquer consulta nova (filtro, ordenação, página) falhava ao validar o HTML contra o contrato.
Reproduz-se encerrando o worker pelo DevTools (`ServiceWorker.stopAllWorkers`) e é coberto por `mock-resilience.spec.ts`.

Correção em duas pontas, sem lógica de negócio fora de `src/mocks/`:

- `lib/http/client.ts`: resposta `text/html` de uma rota `/api` é tratada como falha de rede (nunca chega à
  validação) e dispara o evento `kurio:api-unreachable`. As leituras do Query já tentam de novo (§8.3), então a segunda
  tentativa encontra o worker restaurado.
- `mocks/worker-guard.ts`: sobre o evento, ao focar a janela, ao voltar a aba para o primeiro plano, ao reconectar e a
  cada 15 s com a aba visível, faz `GET /api/__mock__/ping`; se a resposta não for JSON, reenvia `MOCK_ACTIVATE` ao
  worker, que volta a atender a aba.

## 6. Fixtures

O catálogo é gerado em tempo de execução por `src/mocks/fixtures/generate-nfts.ts`, a partir da seed fixa `20261027`
(PRNG `mulberry32`), só na primeira visita ou após o reset; visitas seguintes leem a base persistida. A saída é idêntica
byte a byte à do antigo arquivo gerado (conferida por deep-equal na troca), e o `NFT_FIXTURE_REVISION` fica em
`fixtures/revision.ts`. Não há mais um literal de 200 KB no bundle nem script para rodar.

São 239 NFTs, 27 páginas de 9. A distribuição por coleção reproduz exatamente o sidebar do Figma
(33, 12, 65, 39, 23, 17, 19, 13 e 18). Os nove primeiros itens, na ordem de "Listados
recentemente", são os do layout, com nome, preço e raridade idênticos (Emerald Ape #042 a 1.19,
Neon Vessel #552 a 1.99 com 2.29 riscado, e assim por diante). O Figma deixa o nome do oitavo
card em branco; a fixture o chama de Golden Echo #233.

O restante é gerado com preços de 0.02 a 12.30 ETH, a mesma faixa do filtro do layout, com
distribuição enviesada para valores baixos. Há 4 NFTs esgotados, 22 com preço anterior riscado e
edições com estoque de 0 a 40, para que cada cenário exista de verdade.

Cada NFT tem as quatro edições do layout, `1/1`, `1/10`, `1/50` e `ABERTA`. O preço exibido é o
da `1/50`, que é a edição selecionada por padrão no Figma.

As contagens por rede do Figma (119, 78 e 86) somam 283 e são incompatíveis com as de coleção,
que somam 239. A fixture mantém as de coleção e distribui as redes na mesma proporção (101, 66 e
72); as contagens exibidas na interface são derivadas dos dados.

Os textos descritivos (descrição curta, história, notas de rede, contrato e direitos autorais) são
gerados por template em `src/mocks/db/copy.ts` em vez de guardados 239 vezes, e o `alt` de cada
imagem descreve o personagem. O Figma troca os rótulos "Contrato" e "Direitos autorais" entre o
texto de royalties e o endereço; a interface corrige o pareamento.

Dois usuários (`ana@kurio.test`, `bruno@kurio.test`) com carrinhos, favoritos, carteiras e pedidos
disjuntos sustentam os cenários de isolamento entre contas. As senhas são fictícias, existem em
texto apenas no seed e são guardadas com hash na base simulada. Credenciais no README do projeto.

## 7. Decisões de código

O código não carrega comentários; o "porquê" não-óbvio mora aqui.

### 7.1 Dinheiro

- Valores em ETH são `EthAmount`, uma string decimal com brand do Zod. Uma string qualquer não
  é aceita onde se espera um valor, e toda aritmética passa por `lib/money/eth.ts`.
- `big.js` é configurado com `NE = -21` e `PE = 40`: sem isso `toString()` produz notação
  exponencial (`1e-7`) para valores pequenos, que não passa no regex do schema e quebraria o
  round-trip. `DP = 18` (precisão de wei) com arredondamento para baixo.
- `subtractEth` trava em zero: um desconto nunca produz total negativo.
- `formatEth` usa sempre ponto como separador e remove zeros à direita com piso de duas casas,
  igual ao Figma (`1.19 ETH`, `8.936 ETH`).

### 7.2 Catálogo

- A consulta aplica filtros, depois ordenação, depois paginação. Paginar um conjunto ainda não
  ordenado tornaria a página 2 inalcançável.
- Todo comparador tem desempate por `id`. Sem ele, dois NFTs com o mesmo preço trocariam de lugar
  entre requisições, o que faria a paginação pular itens e as baselines visuais oscilarem.
- Os feeds são conjuntos diferentes, e cada um tem a sua ordenação padrão (`DEFAULT_SORT_BY_FEED`): `all` e `new` usam
  "Listados recentemente"; `trending` usa "Mais populares". `new` são os NFTs lançados nos 14 dias anteriores à data fixa
  do catálogo (`launchedAt`, um a cada quatro NFTs é recente) e `trending` é `favoritesCount >= 150`. A data é fixa, e
  não o relógio, para o catálogo ser determinístico. A ordenação só entra na URL quando difere do padrão da aba, e trocar de
  aba leva a ordenação junto enquanto ela seguia o padrão. O `NFT_FIXTURE_REVISION` é conferido contra o gerador por um
  teste, então mudar as fixtures sem atualizar a revisão falha a suíte.
- Serialização dos parâmetros vive em `lib/url/catalog-params.ts` e é usada pela rota e pelo
  handler. Só valores fora do padrão entram na URL, então `/` e `/?feed=all&page=1` resolvem para
  a mesma query key.

### 7.3 Carrinho

- Uma taxa de rede por cadeia distinta no carrinho: comprar em duas redes são duas transações
  on-chain, então cobrar uma só subestimaria o total.
- No login, o carrinho do visitante é fundido ao da conta. Quantidades que não cabem mais no
  estoque são reduzidas ao possível em vez de rejeitadas: perder a linha inteira por uma edição
  esgotada seria pior do que comprar menos.
- Cupom de valor fixo nunca excede o subtotal. Carrinho vazio não carrega cupom.

### 7.4 Base simulada

- A base persiste em `localStorage` com `schemaVersion`. Um payload de versão diferente é
  descartado e a base é semeada de novo, porque um mock migrado pela metade é pior que um novo.
- `mutate()` persiste e só depois emite eventos, então nenhum evento sai antes de o estado estar
  consistente.
- Senhas usam SHA-256 com salt por usuário. Não é o que um backend real usaria (precisaria de
  Argon2 ou bcrypt), mas mantém o seed reprodutível, o que um hash lento não permitiria.
- A chave de idempotência compara o hash de um JSON com chaves ordenadas, de modo que a ordem
  das chaves do corpo não transforma a mesma tentativa em conflito.
- Sessões expiradas são removidas na primeira leitura, então a expiração se comporta igual
  tanto no meio da navegação quanto entre carregamentos de página.

## 8. Estado, cache e sincronização

### 8.1 Camadas

`contracts/` (Zod) → `features/*/api` (Axios + parse) → `features/*/hooks` (TanStack Query) → componentes. Nenhum
componente chama o Axios; nenhuma resposta fictícia existe fora de `src/mocks/`. O cliente HTTP
(`lib/http/client.ts`) injeta `Authorization` e `x-visitor-id`, aplica timeout de 8 s e normaliza todo erro em
`ApiRequestError { kind, status, code, fields }`. Um `401` fora das rotas de credencial dispara a expiração de sessão
(§10.1).

### 8.2 Chaves de query e isolamento

```
['catalog', scope, 'list' | 'detail' | 'related' | 'featured', ...]
['private', scope, 'cart' | 'quote' | 'wallets' | 'profile' | 'favorites' | 'orders', ...]
```

`scope` é o id do usuário autenticado ou `guest`. Dados privados nunca compartilham chave entre usuários, e a chave
inclui todos os parâmetros da consulta (filtros, ordenação, página). Login, logout e expiração chamam
`resetQueryCache`, que cancela as consultas em voo e remove o cache inteiro, de modo que nada da sessão anterior sobrevive.

### 8.3 Política de cache e retry

| Item | Política |
| --- | --- |
| Padrão | `staleTime` 30 s, `gcTime` 5 min, sem refetch ao focar a janela |
| Retry de leitura | Até 2 tentativas; nenhuma em 4xx |
| Retry de mutation | Nenhum. Repetir é decisão do usuário, e pedidos usam idempotência |
| Catálogo e favoritos (lista) | `keepPreviousData`: a página anterior continua visível, com `aria-busy`, enquanto a nova carrega |
| Facetas (coleções, redes, destaques) | `staleTime` 5 min |
| Carteiras e IDs de favoritos | `staleTime` 60 s |
| Carrinho | `staleTime` 10 s; mutations gravam a resposta no cache e, em erro, invalidam |
| Sessão (`/auth/session`) | `staleTime` 60 s; retry só para falha transitória (rede, timeout, 5xx), até 2 vezes. Só `401` expira a sessão; qualquer outra falha mostra a tela de erro da rota com "Tentar novamente" e mantém o contexto |
| Cotação | `staleTime` infinito e `gcTime` 0, com refetch ao focar a janela; é refeita por evento `nft.updated` e pelo botão "Atualizar cotação" |
| Pedido pendente | Polling a cada 1,5 s enquanto `status === 'pending'`, além do evento `order.updated`; a consulta só existe com um id de pedido (nada de `GET /orders/` vazio) |
| Respostas obsoletas | O `AbortSignal` do Query cancela a consulta anterior; a chave com os parâmetros descarta o resto |

Invalidação coerente: mutations de carrinho gravam a resposta no cache (a API devolve o carrinho inteiro); eventos
`nft.updated` invalidam carrinho e cotação; `order.updated` terminal invalida carrinho e catálogo.

### 8.4 Atualização otimista

O favorito atualiza `favorites/ids` antes da resposta (`onMutate`), guarda o estado anterior e o restaura em `onError`
com aviso ao usuário; `onSettled` revalida IDs e lista. O teste E2E derruba a rota com o cenário `server-error`,
confere o rollback e a recuperação.

## 9. Tempo real no cliente

`features/realtime` é carregado de forma preguiçosa (`React.lazy` no root). Isso é requisito do transporte (§2.2 c), e
também tira `socket.io-client` do caminho crítico.

- Um socket por usuário: o efeito depende do `userId`, então troca de usuário fecha o socket anterior
  (`removeAllListeners` + `disconnect`) e abre outro, que se identifica com `session.identify`.
- **Ledger de eventos** (`lib/event-ledger.ts`): descarta `eventId` repetido e qualquer versão menor ou igual à maior já
  vista para o recurso. Duplicatas e eventos antigos são inofensivos.
- **Guarda de versão no cache** (`lib/patch-nft.ts`): o patch só altera um NFT cujo `version` seja menor que o do evento,
  em listas, detalhe, relacionados, destaques e favoritos.
- **Guarda de dono**: `order.updated` só entra no ledger e no cache se `ownerId` for o usuário atual. A checagem vem
  **antes** do ledger: um evento de outro dono com versão alta não pode bloquear os eventos reais do pedido.
- **Estados terminais**: pedido `confirmed` ou `declined` nunca é alterado por evento posterior, mesmo com versão maior.
- **Reconciliação**: a cada reconexão (não na primeira conexão) as queries ativas de `['catalog', scope]` e
  `['private', scope]` são invalidadas e relidas por REST. Enquanto ela não termina, eventos continuam sendo aplicados pela
  regra de versão, então uma resposta REST mais antiga não sobrescreve um evento mais novo. O contador de versões do
  servidor simulado nunca volta atrás (nem no reset), para o ledger do cliente não descartar eventos novos.
- **Efeitos de UI no carrinho**: reduzir ou alterar preço ou estoque de um item mostra um aviso (`sonner`, região
  `aria-live`), atualiza o resumo e deixa uma **nota persistente na linha do item** ("Subiu, era 1.19 ETH", "Restam 1"),
  com ícone e texto, que some ao editar a quantidade. Comprar as últimas unidades não gera aviso contra o próprio
  usuário (há um pedido em andamento).
- **Efeitos de UI no checkout**: a cotação é refeita, aparece o alerta com as mudanças e **Confirmar compra** fica
  desabilitado até o usuário aceitar (§10.3). Se o diálogo de confirmação estava aberto, ele fecha e o alerta é
  rolado para a vista. Pedido terminal fora da tela do recibo gera um aviso com atalho para o recibo.
- **Carga**: o `RealtimeBridge` (e com ele o `socket.io-client`) monta depois do primeiro conteúdo, em tempo ocioso, para
  qualquer usuário; os testes esperam a conexão antes de disparar eventos.

## 10. Sessão, carrinho e pedido

### 10.1 Sessão

Token em `localStorage` (`kurio:session-token`), consultado por `useSyncExternalStore`; a sessão vem de
`GET /auth/session`. As rotas privadas ficam sob o layout `_authed`, cujo `beforeLoad` redireciona para
`/entrar?redirect=...`; o destino passa por `sanitizeRedirect` (apenas caminhos internos, nunca outro host nem `//`, nem
as rotas de acesso).

Expiração: um `401` limpa o token e o cache e leva a `/entrar?redirect=<local atual>&expired=1`. Durante o carregamento
inicial de uma rota o `beforeLoad` é quem redireciona (o handler global só limpa o estado), o que evita redirecionamento
aninhado. Logout navega para a página inicial a partir do próprio hook da mutation, porque callbacks passados a
`mutate()` não rodam se o componente desmonta.

### 10.2 Carrinho

Estado no servidor, por usuário ou por `x-visitor-id`. A linha guarda só `nftId + editionId + quantity`; preço, subtotal e
limites são projetados do NFT (§5.1). O cache do cliente é sempre substituído pela resposta da API; nada de dinheiro é
calculado na interface.

### 10.3 Pedido

1. `POST /quotes` gera a cotação (e as `issues`). 2. A conexão de carteira é simulada (`connect`, `disconnect`; o cenário
`wallet=reject` a recusa). 3. `POST /orders` leva a chave `x-idempotency-key`, estável por cotação. 4. O recibo é um
snapshot imutável.

**Cotação aceita de forma explícita.** O servidor compara cada cotação nova com a **última cotação aceita** pelo usuário
(a primeira, a devolvida por `acknowledge` ou uma sem `issues`), e não com a última emitida. Assim o alerta de preço
alterado persiste através de refetch por foco, troca de carteira, reload ou nova cotação, até o usuário clicar em
"Aceitar alterações e atualizar". A cotação com qualquer `issue`, ou vencida, não pode ser enviada: o botão de
confirmação e o botão do diálogo ficam desabilitados e um `409 QUOTE_STALE` fecha o diálogo e mostra o alerta. A
validação de envio (`isQuoteStale`) também reavalia o cupom.

Recuperação: o id do pedido pendente fica em `localStorage`, e `/pedido/:id` relê o pedido (e continua vivo por polling e
evento). Se a criação termina em erro de transporte ou 5xx — resultado ambíguo — o corpo da tentativa é guardado, e o
checkout mostra **Verificar pedido**. Toda nova tentativa reenvia o **corpo guardado** com a **mesma chave** (a mutation
sempre lê a tentativa persistida), então um timeout nunca gera uma segunda compra. Como o pedido pode já ter sido criado e
confirmado enquanto a resposta se perdia (o carrinho vazio desmontaria o formulário), essa tentativa é independente do
formulário.

**Privacidade.** O logout apaga o token, as notas do carrinho, a tentativa de pedido (que guarda nome e e-mail do
colecionador), o pedido pendente e as chaves de idempotência (`features/auth/lib/clear-private-data.ts`), além de
zerar o cache do Query. Login, cadastro, troca de usuário e expiração zeram o cache do Query e trocam o token; a expiração
**preserva** a tentativa e o pedido pendente do próprio usuário (guardados por id de usuário) justamente para a retomada
após novo login, e a troca de usuário nunca os lê, porque as chaves pertencem a outro escopo.

## 11. Layout responsivo

| Faixa | Layout |
| --- | --- |
| < 768 px | Mobile: frames móveis do Figma (cabeçalho próprio, barra inferior com entalhe e botão central, painéis fixos) |
| 768 – 1279 px | Tablet: o layout mobile em coluna central de 640 px; barras fixas respeitam a mesma largura |
| ≥ 1280 px | Desktop: frames de 1440 px, contêiner de 1200 px |

A troca mobile/desktop é feita por `useIsDesktop()` (`min-width: 1280px`), de modo que só uma árvore é montada. Os
elementos de casca usam `xl:` com o mesmo limite. Nos 1280 px o conteúdo de 1200 px ainda cabe com respiro.

O Figma só tem frame mobile para início, detalhe, carrinho, pagamento, login e cadastro. Confirmação, perfil, carteiras,
favoritos e 404 no mobile são derivados do padrão visual (modal em tela cheia, chips de navegação no lugar da barra
lateral).

## 12. Acessibilidade

- Pular para o conteúdo, foco visível global (`:focus-visible`) e foco inicial no primeiro campo dos diálogos de acesso.
- Diálogos e drawers usam Radix: foco aprisionado, retorno do foco ao gatilho, `Esc`. O título acessível dos diálogos é
  distinto do título visível (evita leitura duplicada).
- Campos têm `label` (visível ou `sr-only`), `aria-invalid` e `aria-describedby` para a mensagem de erro; os selects
  (rede, tipo de carteira, domínio ENS) recebem os mesmos atributos e `aria-required` (`controlAria`), já que o asterisco
  visual é `aria-hidden`.
- Cada rota define `document.title` e um anúncio educado (`role="status"`) quando o título muda; diálogos devolvem o foco ao
  elemento que os abriu (busca, ampliar imagem, confirmação de compra).
- O botão de diminuir quantidade bloqueado usa `aria-disabled`, e não `disabled`, para continuar focável e explicar o
  limite (dica e aviso `aria-live`); as notas de preço/estoque do carrinho têm ícone e texto, nunca só cor.
- O `overflow-x: clip` do corpo esconde vazamentos reais, então o teste de responsividade mede os retângulos dos
  elementos em 320, 390, 768 e 1440 px, e não `scrollWidth`.
- O simulador é um `<aside aria-label="Simulador de mercado">` não modal, com linha de status `aria-live`, fechável por `Esc`.
- Mutations e eventos em tempo real anunciam por regiões `aria-live` (`sonner`, totais do carrinho, aviso de cotação).
- Ações fora do escopo (Criadores, Aprenda, Atividade, Ofertas, Arquivos baixados, Suporte, login social, recuperar
  senha) são botões `aria-disabled` que respondem com aviso "não está disponível nesta versão"; nunca fingem sucesso.
- O carrossel de destaques não avança sozinho com `prefers-reduced-motion`, pausa com foco visível por teclado e com a aba
  oculta, e o ponto ativo usa `aria-current`.
- Alvos dos indicadores de carrossel, semântica de `dl`, ordem de títulos e `aria-controls` foram auditados e
  corrigidos a partir do relatório do Lighthouse.

## 13. Performance e auditoria

### 13.1 Decisões de build

- `socket.io-client`, formulários e carrosséis ficam fora do caminho crítico (lazy). O MSW é importado dinamicamente e só
  em modo de mocks (`VITE_ENABLE_MOCKS`).
- Chunks agrupados (`build.rolldownOptions.output.codeSplitting`): `vendor` (React, TanStack, Axios, Zod) e `mocks`
  (MSW e fixtures). O agrupamento reduziu o número de requisições da página inicial de dezenas para cerca de 30.
  **Atenção:** `engine.io-client` captura `WebSocket` ao ser avaliado; nunca pode cair num chunk avaliado antes do
  `worker.start()` (§2.2 c). Qualquer mudança de chunking exige rodar a suíte E2E de tempo real.
- Um plugin de build injeta `modulepreload` para o chunk de mocks e para as rotas da página inicial, paralelizando o que
  antes era uma cadeia de requisições.
- `tldts` (lista de sufixos públicos, ~300 KB) é apontado para um shim mínimo (`src/mocks/shims/tldts.ts`). Ele só serve
  ao `tough-cookie` do MSW, e o ambiente de mocks usa `Authorization`, não cookies.
- Source maps emitidos (exigência de Best Practices para JS grande); `robots.txt` e favicon declarados.

### 13.2 Como a auditoria é feita

`npm run lighthouse` compila, sobe `lighthouse/serve.mjs` (servidor estático HTTP/2 com Brotli, certificado
autoassinado, que reproduz o comportamento de uma CDN como a da Vercel) e roda 3 medições por página e perfil, com
armazenamento limpo a cada execução. Os relatórios HTML/JSON e a tabela de medianas ficam em `lighthouse/reports/` e
`lighthouse/RESULTS.md`. `LH_SERVER=preview` usa o `vite preview` (HTTP/1.1) para comparação.

### 13.3 Resultados e causas

Ver `lighthouse/RESULTS.md`. O desktop atende a todas as metas. No perfil mobile (4G lenta, CPU 4× simulados) o
desempenho fica na faixa de 83–90 conforme a CPU do host (o índice de benchmark do Lighthouse é registrado em `lighthouse/RESULTS.md`: o TBT sobe de ~300 para ~500 ms quando o índice cai de ~2000 para ~1500), no limite da meta. As causas, medidas no trace:

1. **Rede, não CPU, domina o LCP**: com CPU 1× e rede lenta o LCP é de ~4,3 s; com CPU 4× e rede rápida, 0,6 s. O
   gargalo é a quantidade de bytes de JS antes de renderizar, e a camada de mocks (MSW + 239 fixtures, ~115 KB gzip) é
   cerca de 40% disso.
2. **TBT** (~300 ms): avaliação de `vendor` e `mocks`, cerca de 80 ms cada em 1× (sem ponto único; distribuído).
3. Em HTTP/1.1 (`vite preview`) o mesmo build cai para ~80, porque dezenas de arquivos pequenos viram várias ondas de
   requisição. Em produção (HTTP/2/3) isso não ocorre.

Sem a camada de mocks (o backend real responderia por ela) o orçamento de JS cairia pela metade; ela é parte do que o
enunciado manda auditar, então nada foi removido ou simplificado só para a medição.

## 14. Testes

`npm run test:e2e` (Playwright, Chromium) sobe o **build de produção** (`npm run build && vite preview`, sempre novo: `reuseExistingServer`
é falso) com os mocks ativos. Projetos: `desktop` (1440×900) executa tudo; `mobile` (390×844) executa os testes marcados `@mobile`.
Cada teste roda num contexto novo, portanto com `localStorage` vazio e base semeada de novo.

**Controle de tempo, latência e eventos.** O relógio das cenas sensíveis a tempo é controlado por `page.clock` (rotação do
destaque, liquidação do pedido, vencimento da cotação e da sessão); a latência e as falhas vêm dos cenários dos mocks
(§5.3); os eventos de tempo real são disparados pelas rotas de controle (§5.4) e chegam ao app pelo `socket.io-client`.
Esperas fixas foram trocadas por condições observáveis (`expect.poll`, `settleFrames`).

**Cobertura dos 12 cenários do enunciado** (tabela por arquivo no README, seção "Testes com Playwright"), incluindo, além
do caminho feliz: resultado vazio, respostas fora de ordem, restauração pelo histórico, expiração de sessão no meio da
navegação e da confirmação do pedido, otimismo observável e falha ao desfavoritar, clique repetido e timeout com a mesma
chave de idempotência, recusa e desconexão da carteira, preço e disponibilidade alterados com o diálogo de confirmação
aberto, evento de outro dono, pedido terminal, queda do socket com pedido pendente, validação do checkout e foco de
todos os diálogos, falha e nova tentativa em detalhe, carrinho e pagamento, e ausência de deslocamento de layout nos
skeletons.

**Regressão visual.** `visual.spec.ts` compara início, detalhe, carrinho e pagamento em 1440 e 390 px com
`maxDiffPixelRatio` de 2%, animações desativadas, relógio e dados fixos. As baselines (`e2e/__screenshots__/{projeto}/`)
foram geradas no Chromium do Playwright em Windows. Em outro sistema a renderização de texto pode diferir; revise o
diff do relatório e, se for só renderização, `npm run test:e2e:update`.

Relatório HTML em `playwright-report/` e traces das falhas em `test-results/` (`trace: retain-on-failure`); ambos são gerados a
cada execução e por isso não são versionados.

## 15. Limitações assumidas

- Sem backend real: sessão em `Authorization`/`localStorage`, senhas em SHA-256 com salt, tempo real simulado no navegador.
- **Cada aba tem a sua própria base simulada** (em memória, persistida no `localStorage` ao mudar); a última escrita vence entre
  abas. Por isso o simulador de mercado age sobre a aba em que foi aberto.
- O MSW intercepta WebSocket mas não HTTP long-polling, então o cliente fala só WebSocket (§2.2); o `@mswjs/socket.io-binding`
  não implementa namespaces nem rooms e usa um `sid` fixo (§2.4).
- Login social, recuperação de senha, Atividade, Ofertas, Arquivos baixados, Suporte, Criadores e Aprenda não existem; os
  controles correspondentes avisam que estão fora do escopo.
- O avatar é um seletor de emoji (não há upload) e não existe tela de histórico de pedidos (§4).
- A interface não faz cálculo monetário; o servidor é a referência. A apresentação arredonda a quatro casas decimais.
- Em desenvolvimento (`npm run dev`) o `StrictMode` abre duas conexões Socket.IO por montagem; uma é encerrada antes do
  handshake. Não ocorre no build.
- Os resultados do Lighthouse mobile dependem da CPU do host (§13.3): o índice de benchmark é registrado a cada execução.
- As baselines visuais foram geradas em Windows (§14).

## 16. Contratos REST e eventos

Todos os schemas vivem em `src/contracts/` como schemas Zod; os tipos TypeScript são inferidos com `z.infer`. Os mesmos
schemas validam as respostas no cliente e as requisições nos handlers do MSW, de modo que um desvio de contrato falha no
ponto da rede, não três camadas acima na interface. Base path: `/api`.

### 16.1 Convenções

**Dinheiro.** Valores em ETH trafegam como strings decimais (`"1.19"`), nunca como `number`. O tipo `EthAmount` é branded, então
uma string qualquer não é aceita onde se espera um valor. Toda aritmética passa por `src/lib/money/eth.ts` (`big.js`).
Quantidades são inteiras.

**Versão.** Todo recurso mutável carrega `version: number`, monotônico. Respostas REST e eventos Socket.IO carregam o mesmo
contador. O cliente guarda a maior versão vista por recurso e descarta o que não for estritamente maior, o que torna
evento duplicado e fora de ordem inofensivo em vez de regressivo.

**Erros.** Toda resposta não-2xx usa o mesmo envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "E-mail inválido" } } }
```

| `code` | HTTP | Significado |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Entrada rejeitada; `fields` mapeia campo → mensagem |
| `UNAUTHENTICATED` | 401 | Sessão ausente ou expirada |
| `FORBIDDEN` | 403 | Autenticado, mas a operação foi recusada (por exemplo, a carteira recusou a conexão) |
| `NOT_FOUND` | 404 | Recurso inexistente, ou que pertence a outro usuário (a resposta é a mesma, para não revelar a existência) |
| `CONFLICT` | 409 | Disponibilidade, cadastro duplicado, reuso de chave de idempotência com outro conteúdo |
| `COUPON_INVALID` | 422 | Código desconhecido |
| `COUPON_EXPIRED` | 422 | Código conhecido, fora da validade |
| `QUOTE_STALE` | 409 | Preço, disponibilidade, cupom ou validade da cotação mudaram desde que ela foi emitida |
| `SERVER_ERROR` | 500 | Falha transitória; seguro repetir |

**Sessão.** O token é opaco, enviado em `Authorization: Bearer` e guardado no `localStorage` (§5.5, §10.1). A resposta de
sessão traz `expiresAt`; a interface reage ao `401`, não antecipa a expiração.

**Visitante.** Toda requisição envia `x-visitor-id`, um UUID gerado no primeiro acesso. O carrinho de quem ainda não entrou
fica ligado a esse identificador e é fundido ao da conta no login.

**Paginação.** Listas respondem `{ items, pagination: { page, perPage, total, totalPages } }`.

### 16.2 Sessão e conta

| Método | Rota | Corpo | Resposta | Erros |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | `RegisterInput` | `201 Session` | `409` e-mail ou usuário em uso · `422` |
| `POST` | `/auth/login` | `LoginInput` | `200 Session` | `401` credenciais inválidas · `422` |
| `GET` | `/auth/session` | — | `200 Session` | `401` |
| `POST` | `/auth/logout` | — | `204` | — |

Senhas nunca trafegam de volta e são guardadas com hash e salt na base simulada. A sessão dura 30 minutos, sem renovação.

### 16.3 NFTs

| Método | Rota | Resposta | Erros |
| --- | --- | --- | --- |
| `GET` | `/nfts` | `200 NftListResponse` | `422` parâmetros inválidos |
| `GET` | `/nfts/:slug` | `200 NftDetail` | `404` |
| `GET` | `/nfts/:slug/related` | `200 NftSummary[]` | `404` |
| `GET` | `/featured` | `200 { hero, spotlight }` | — |
| `GET` | `/collections` | `200 Collection[]` | — |
| `GET` | `/networks` | `200 NetworkOption[]` | — |

Parâmetros de `/nfts`, validados pelo mesmo `catalogQuerySchema` que valida os search params da rota:

| Parâmetro | Tipo | Padrão |
| --- | --- | --- |
| `q` | string | — |
| `collections` | string[] | `[]` |
| `networks` | `ethereum \| polygon \| solana`[] | `[]` |
| `rarity` | `common \| rare \| legendary`[] | `[]` |
| `minPriceEth` / `maxPriceEth` | decimal string | — |
| `feed` | `all \| new \| trending` | `all` |
| `sort` | `recent \| price-asc \| price-desc \| popular` | `recent` (`popular` na aba `trending`) |
| `page` | inteiro positivo | `1` |

Filtros são combináveis e qualquer mudança de filtro reinicia `page` para 1 (§7.2 descreve os feeds e a ordenação padrão).

### 16.4 Favoritos

Exigem autenticação.

| Método | Rota | Resposta |
| --- | --- | --- |
| `GET` | `/favorites/ids` | `200 { nftIds: string[] }` |
| `GET` | `/favorites` | `200` lista paginada de `NftSummary` |
| `PUT` | `/favorites/:nftId` | `204` |
| `DELETE` | `/favorites/:nftId` | `204` |

A lista de ids existe separada da lista paginada para que o coração do catálogo não dependa dos summaries completos. É
também o alvo da atualização otimista com rollback (§8.4).

### 16.5 Carrinho

| Método | Rota | Corpo | Resposta | Erros |
| --- | --- | --- | --- | --- |
| `GET` | `/cart` | — | `200 Cart` | — |
| `POST` | `/cart/items` | `AddCartItemInput` | `200 Cart` | `409` sem disponibilidade · `404` |
| `PATCH` | `/cart/items/:itemId` | `UpdateCartItemInput` | `200 Cart` | `409` · `404` |
| `DELETE` | `/cart/items/:itemId` | — | `200 Cart` | `404` |
| `POST` | `/cart/coupon` | `ApplyCouponInput` | `200 Cart` | `COUPON_INVALID` · `COUPON_EXPIRED` |
| `DELETE` | `/cart/coupon` | — | `200 Cart` | — |

No login, os itens do visitante são incorporados ao carrinho da conta; quantidades que excedam a disponibilidade são
reduzidas ao máximo possível. Os totais (`subtotalEth`, `discountEth`, `networkFeeEth`, `totalEth`) são sempre calculados no
servidor; a interface nunca deriva dinheiro.

### 16.6 Cotação

| Método | Rota | Corpo | Resposta |
| --- | --- | --- | --- |
| `POST` | `/quotes` | `{ walletId, network }` | `200 Quote` |
| `POST` | `/quotes/:id/acknowledge` | — | `200 Quote` (nova cotação) |

A cotação recalcula tudo e devolve `issues[]`:

| `code` | Quando |
| --- | --- |
| `PRICE_CHANGED` | O preço unitário difere do da **última cotação aceita** |
| `AVAILABILITY_REDUCED` | Estoque caiu abaixo da quantidade pedida |
| `SOLD_OUT` | Edição esgotou |
| `COUPON_EXPIRED` / `COUPON_INVALID` | Cupom deixou de valer |

`acknowledge` aplica as correções (preços e quantidades atuais) ao carrinho e devolve uma cotação nova, sem as `issues`
aceitas, que passa a ser a base das próximas comparações. Uma cotação com qualquer `issue`, ou já vencida (`expiresAt`, 5
minutos), não pode ser enviada: o usuário precisa reconhecer as mudanças e pedir nova cotação. É isso que impede uma
compra de passar silenciosamente a um preço desatualizado (§10.3).

### 16.7 Pedidos

| Método | Rota | Corpo | Resposta | Erros |
| --- | --- | --- | --- | --- |
| `POST` | `/orders` | `CreateOrderInput` | `201 Order` | `409 QUOTE_STALE` · `409 CONFLICT` · `404` · `422` |
| `GET` | `/orders/:id` | — | `200 Order` | `404` (inclusive de outro usuário) |
| `GET` | `/orders` | — | `200` lista paginada | `401` |

**Idempotência.** `POST /orders` exige o header `x-idempotency-key`, gerado pelo cliente e estável entre tentativas da mesma
compra (uma por cotação).

- **Mesma chave, mesmo corpo** → devolve o pedido já criado, com o status atual. É isso que permite recuperar o pedido após
  timeout ou clique repetido sem criar uma segunda compra.
- **Mesma chave, corpo diferente** → `409 CONFLICT`.
- O cliente guarda a chave por cotação e a apaga no logout; o servidor mantém a associação chave → pedido.

`status` começa em `pending` e caminha para `confirmed` ou `declined`, ambos terminais: nenhum evento tira um pedido de um
estado terminal. Os itens só saem do carrinho depois da confirmação, e apenas nas quantidades compradas. O pedido guarda um
snapshot imutável dos itens e totais; mudanças posteriores no catálogo não alteram o recibo. A liquidação simulada leva
cerca de 1,5 s; `payment=decline` faz o pedido terminar recusado.

### 16.8 Perfil e carteiras

| Método | Rota | Corpo | Resposta | Erros |
| --- | --- | --- | --- | --- |
| `GET` | `/profile` | — | `200 User` | `401` |
| `PATCH` | `/profile` | `UpdateProfileInput` | `200 User` | `409` usuário/e-mail em uso · `422` |
| `POST` | `/profile/password` | `ChangePasswordInput` | `204` | `422` senha atual incorreta |
| `GET` | `/wallets` | — | `200 Wallet[]` | `401` |
| `POST` | `/wallets` | `WalletInput` | `201 Wallet` | `409` slot ocupado · `422` |
| `PATCH` | `/wallets/:id` | `WalletInput` | `200 Wallet` | `404` · `422` |
| `DELETE` | `/wallets/:id` | — | `204` | `404` |
| `POST` | `/wallets/:id/connect` | — | `200 { walletId, connected }` | `403` carteira recusou · `404` |
| `POST` | `/wallets/:id/disconnect` | — | `200 { walletId, connected }` | `404` |

`connect` e `disconnect` simulam a extensão de carteira. O cenário `wallet=reject` faz a conexão responder `403 FORBIDDEN`.
Os campos `linkedReference` (ENS ou carteira vinculada, opcional), `profileName` e `referralCode` fazem parte de `Wallet`. O
formato do endereço é validado por rede: `0x` + 40 hex para Ethereum e Polygon, base58 de 32 a 44 caracteres para Solana.

### 16.9 Eventos Socket.IO

Transporte, restrições e limitações estão na §2. O cliente conecta em `/socket.io` (só WebSocket), identifica-se com
`session.identify` a cada `connect` e assina os dois eventos abaixo.

**`nft.updated`** (servidor → cliente), enviado a todos os clientes:

```ts
{
  eventId: string      // único por emissão, distinto do id do recurso
  resource: 'nft'
  id: string
  version: number
  priceEth: string
  previousPriceEth: string | null
  available: number
  editions: Array<{ id: string; available: number; priceEth: string }>
  at: string           // ISO-8601
}
```

Atualiza preço e disponibilidade no catálogo, no detalhe e no carrinho, e refaz a cotação do checkout.

**`order.updated`** (servidor → cliente), enviado só aos sockets do dono:

```ts
{
  eventId: string
  resource: 'order'
  id: string
  version: number
  status: 'pending' | 'confirmed' | 'declined'
  confirmedAt: string | null
  declinedReason: string | null
  ownerId: string      // escopo do evento
  at: string
}
```

`ownerId` existe para que um socket remanescente de uma sessão anterior não consiga escrever no cache de outro usuário: o
cliente ignora todo evento cujo dono não seja o usuário autenticado, e a checagem acontece antes do ledger (§9).

**`session.identify`** (cliente → servidor): `{ userId: string | null }`, reenviado a cada `connect` e a cada troca de
usuário, para que o servidor saiba a quem endereçar os eventos privados.

### 16.10 Reconciliação REST ↔ Socket.IO

O servidor simulado monta cada evento lendo o mesmo store que os handlers REST leem (§5.2), então REST e evento nunca
divergem. No cliente, a regra de versão (ledger + guarda no cache) torna duplicados e eventos antigos inofensivos. Ao
reconectar, o cliente invalida as queries dos recursos ativos e relê tudo por REST; eventos recebidos durante a leitura
continuam sendo aplicados pela regra de versão, de modo que uma resposta REST mais antiga não sobrescreve um evento mais
novo. Pedidos pendentes são recuperados pelo id guardado, por polling e por evento, sem criar outra compra.

### 16.11 Plano de controle da simulação

Rotas exclusivas do ambiente de mocks, fora da simulação de rede; a lista completa está na §5.4.
