# Arquitetura — Kurio NFT Marketplace

> Documento vivo. Esta versão cobre a camada de tempo real e de mocks, validada
> por spike executável em `/spike/realtime`. Demais seções serão preenchidas
> conforme as features forem entregues.

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

`/spike/realtime` é a página de smoke test do transporte. Ela mostra estado da
conexão, uptime e log de eventos, e aceita `?heartbeat=0` para reproduzir o
ping timeout. Serve de base para os testes E2E de tempo real.

## 4. Desvios do Figma

| Item | Desvio | Motivo |
| --- | --- | --- |
| Cor de erro | Adicionado `#E2574C` | O Figma só usa o laranja primário no asterisco de campo obrigatório; não há cor de erro de validação |
| Cor de sucesso | Adicionado `#5C9E6B` | Necessária para pedido confirmado; ausente no Figma |
| Hover de botão | Adicionado `#C07A3C` | Ausente no Figma |
| Surface elevada | Adicionado `#2F1D17` | Para estados de hover/accent do shadcn |
| Separador decimal | Ponto em todos os valores | O Figma alterna entre `1.19 ETH` nos cards e `0,02 - 12,30 ETH` no filtro. ETH é escrito com ponto mundialmente; usar vírgula só no filtro seria inconsistência replicada |

Todos mantêm a família de matiz da paleta e estão marcados em comentário no
`src/app/styles/globals.css`.

### 4.1 Assets de NFT

As artes de primata do Figma não acompanham o arquivo exportado, mas três delas foram fornecidas
(macaco dourado de fones, macaco escuro de blazer, macaco marrom de óculos). O quarto personagem
que domina o catálogo do layout, o gorila cinza de chapéu e moletom roxo, não veio como arquivo e
foi recortado do screenshot em resolução original (476 px, recorte com margem para evitar os
cantos arredondados do card).

Os quatro originais ficam em `assets/nft-source/` e `npm run art` gera as variantes otimizadas em
`public/nft/` (`{arte}-480.webp` e `{arte}-960.webp`, 14 a 56 KB cada, contra 140 a 188 KB dos
originais). Há quatro personagens para 239 NFTs, então as artes se repetem entre itens: é a mesma
repetição que o próprio Figma faz.

O Sage tem origem de 476 px e é ampliado para 960 px, ficando mais suave no detalhe do que os
outros três. Para trocar por uma arte nativa basta substituir `assets/nft-source/sage.webp`.

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
| `POST /api/__mock__/reset` | Restaura o cenário semeado |
| `GET\|POST /api/__mock__/scenario` | Lê ou ajusta as condições de rede |
| `POST /api/__mock__/expire-sessions` | Expira todas as sessões na hora |
| `GET /api/__mock__/state` | Snapshot para asserção nos testes |

Essas rotas **não** passam pela simulação de rede, de propósito: é preciso
conseguir resetar a base ou desligar uma falha enquanto o cenário `offline`
está ativo, senão a única saída seria limpar o storage na mão.

`expire-sessions` existe porque esperar um TTL real deixaria o teste de
expiração lento e dependente de relógio — inclusive o caso de expirar no meio
do checkout.

### 5.5 Sessão

O token viaja como header `Authorization: Bearer`, não como cookie. O
tratamento de cookie do MSW difere entre o worker do browser e o Node, e um
header se comporta igual nos dois — o que importa porque os mesmos handlers
sustentam a suíte Playwright. Um backend de produção deveria usar cookie
`httpOnly`; é uma simplificação deliberada do ambiente simulado.

Senhas são guardadas como SHA-256 com salt por usuário e nunca voltam na
resposta, nem para a própria conta. Login responde igual para conta
inexistente e senha errada, para não transformar o formulário em um oráculo de
contas.

## 6. Fixtures

`npm run fixtures` regenera o catálogo a partir da seed fixa `20261027`. A saída é commitada,
então um checkout limpo não precisa rodar o script.

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
- O feed `new` usa uma data fixa (`2026-10-01`) em vez do relógio, para o catálogo ser
  determinístico. `trending` é `favoritesCount >= 100`.
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
