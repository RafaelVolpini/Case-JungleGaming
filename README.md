# Kurio — Marketplace de NFTs

Solução do desafio de front-end: descoberta, compra e conta do colecionador, em desktop, tablet e mobile, com API,
autenticação, carteiras, pagamentos e tempo real **simulados na camada de rede** (MSW + Socket.IO). Não há backend,
serviço privado nem variável de ambiente obrigatória: tudo roda a partir de um checkout limpo.

React 19 · TypeScript 5.9 · TanStack Router e Query · Axios · Socket.IO · Tailwind v4 · shadcn/ui (Radix) · MSW ·
Playwright · Lighthouse.

Decisões de arquitetura, contratos REST e eventos, política de sessão, cache e reconciliação, limitações, decisões de UX
e desvios do Figma estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Sumário

1. [Setup](#1-setup)
2. [Comandos](#2-comandos)
3. [Variáveis de ambiente](#3-variáveis-de-ambiente)
4. [Credenciais e cupons fictícios](#4-credenciais-e-cupons-fictícios)
5. [Mocks: cenários, reset e falhas](#5-mocks-cenários-reset-e-falhas)
6. [Testar o tempo real (preço mudando durante a compra)](#6-testar-o-tempo-real-preço-mudando-durante-a-compra)
7. [Testes com Playwright](#7-testes-com-playwright)
8. [Auditoria Lighthouse](#8-auditoria-lighthouse)
9. [Deploy](#9-deploy)
10. [Estrutura do projeto](#10-estrutura-do-projeto)

## 1. Setup

Requer **Node 22.19 ou superior** (o Lighthouse 13 exige 22.19; o Vite 8, 22.12) e npm 10+. Testado com Node 24.

```bash
npm ci
npx playwright install chromium
npm run dev
```

A aplicação sobe em http://localhost:5173 já com os mocks ativos. Para o build otimizado (o mesmo que vai para a
hospedagem): `npm run build && npm run preview`, em http://localhost:4173.

## 2. Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Desenvolvimento com mocks (Vite) |
| `npm run build` | Gera as rotas, confere os tipos e compila para `dist/` |
| `npm run preview` | Serve o build (mocks incluídos) em http://localhost:4173 |
| `npm run typecheck` | Gera as rotas e roda `tsc -b` |
| `npm run lint` | oxlint |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run test:e2e` | Playwright: compila, sobe o preview e roda desktop e mobile |
| `npm run test:e2e:ui` | Playwright no modo interativo |
| `npm run test:e2e:report` | Abre o relatório HTML do último teste |
| `npm run test:e2e:visual` | Só a regressão visual |
| `npm run test:e2e:update` | Atualiza as baselines visuais (use só depois de revisar o diff) |
| `npm run lighthouse` | Compila e audita início e detalhe (3 medições, mobile e desktop) |
| `npm run art` / `npm run art:check` | Regenera as variantes das artes de NFT e confere a qualidade (SSIM) |

## 3. Variáveis de ambiente

| Variável | Padrão | Efeito |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` | `false` desliga o MSW e envia as chamadas a um backend real em `/api`. O build de demonstração deve manter `true` |

Há um `.env.example` na raiz. Nenhuma outra variável é necessária.

## 4. Credenciais e cupons fictícios

| Usuário | E-mail | Senha |
| --- | --- | --- |
| Ana Ribeiro (carteiras principal e secundária cadastradas, 3 favoritos) | `ana@kurio.test` | `kurio-ana-2026` |
| Bruno Carvalho (sem favoritos) | `bruno@kurio.test` | `kurio-bruno-2026` |

Cupons: `KURIO10` (10%), `PRIMEIRACUNHAGEM` (0.05 ETH), `EXPIRADO` e `VENCIDO30` (vencidos). Qualquer outro código é
inválido. Também é possível criar contas novas em `/criar-conta`.

## 5. Mocks: cenários, reset e falhas

Este projeto não tem um backend de verdade. Quem responde às chamadas da API é o MSW, que roda no próprio navegador e
intercepta cada requisição. O tempo real funciona do mesmo jeito: existe um servidor Socket.IO simulado dentro do MSW
(`@mswjs/socket.io-binding`), e o app conversa com ele usando o `socket.io-client` de verdade, sem nenhum atalho.

Tudo o que esse "servidor" sabe (catálogo, usuários, carrinhos e pedidos) fica na memória e é salvo no `localStorage` a
cada mudança, nas chaves `kurio:mock-db` e `kurio:mock-scenario`. Por isso os dados continuam lá depois de recarregar a
página.

Um detalhe que costuma pegar de surpresa: **cada aba do navegador tem a sua própria base**. Se você mudar um preço pelo
simulador numa aba, o app aberto em outra aba não fica sabendo. Use o simulador e o app na mesma aba.

### 5.1 Selecionar o cenário

Pela query string (vale só para aquele carregamento):

| Parâmetro | Valores |
| --- | --- |
| `latency` | `none`, `fast` (padrão, 120 ms), `slow` (1,5 s), `variable`, `out-of-order` |
| `failure` | `none`, `offline`, `server-error`, `timeout`, `intermittent`, `unauthorized` |
| `failScope` | Prefixos de caminho separados por vírgula (`/api/cart,/api/nfts`) |
| `failEvery` | Para `intermittent`: falha 1 a cada N requisições |
| `payment` | `confirm` (padrão) ou `decline` |
| `wallet` | `accept` (padrão) ou `reject` (a conexão da carteira é recusada) |
| `orderTimeout` | `1`: a próxima criação de pedido é executada, mas a resposta nunca chega |
| `seed` | Semente da latência variável |

Exemplos: `/?latency=slow` · `/?failure=server-error&failScope=/api/nfts` · `/pagamento?payment=decline`.

Em tempo de execução, pelo **simulador de mercado** (seção 6) ou pelo console do navegador. As rotas de controle ignoram a
simulação de rede e funcionam com a aplicação aberta:

```js
const post = (path, body = {}) =>
  fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

post('/api/__mock__/reset')                                            // restaura o cenário semeado
post('/api/__mock__/scenario', { payment: 'decline' })                 // altera o cenário
post('/api/__mock__/expire-sessions')                                  // expira todas as sessões
post('/api/__mock__/nfts/emerald-ape-042', { priceEth: '2.00' })       // muda o preço e emite nft.updated
post('/api/__mock__/nfts/emerald-ape-042', { edition: '1/50', available: 1 })
post('/api/__mock__/socket/drop', { holdMs: 5000 })                    // derruba o Socket.IO e segura a queda
post('/api/__mock__/socket/reconnect')                                 // encerra a queda
post('/api/__mock__/socket/replay', { slug: 'emerald-ape-042', mode: 'duplicate' }) // ou 'stale'
```

### 5.2 Reset

- **Reset completo:** `POST /api/__mock__/reset` (ou o botão "Restaurar dados e cenário" do simulador) restaura o cenário
  semeado de forma íntegra: catálogo de 239 NFTs, usuários, carrinhos, pedidos e cenário. O contador de versões nunca
  volta atrás, então o cliente não descarta eventos novos depois de um reset.
- **Reset manual:** apagar o `localStorage` do site e recarregar.
- Os dados são determinísticos: a latência variável vem de um gerador semeado e os ids de cotação, pedido e evento
  seguem um contador persistido.

### 5.3 Reproduzir os fluxos de falha

| Fluxo | Como reproduzir |
| --- | --- |
| Lentidão e skeletons | `/?latency=slow` |
| Respostas fora de ordem | `/?latency=out-of-order` e trocar de aba do catálogo rápido |
| Erro HTTP e nova tentativa | `/?failure=server-error&failScope=/api/nfts`; depois `post('/api/__mock__/scenario', { failure: 'none', scope: [] })` e **Tentar novamente** |
| Sem conexão | `/?failure=offline` |
| Sessão expirada | Entre, rode `expire-sessions` e navegue, recarregue ou confirme um pedido |
| Conflito de cadastro | Cadastre `ana@kurio.test` em `/criar-conta` |
| Resultado vazio | Busque `zzz` no catálogo |
| Cupom inválido ou expirado | Use `NAOEXISTE` e `EXPIRADO` no carrinho |
| Pagamento recusado | `post('/api/__mock__/scenario', { payment: 'decline' })` e conclua a compra |
| Carteira recusa a conexão | `post('/api/__mock__/scenario', { wallet: 'reject' })` |
| Timeout após criar o pedido | `post('/api/__mock__/scenario', { orderTimeout: true })`; após ~8 s use **Tentar novamente** ou **Verificar pedido**: volta o mesmo pedido, sem segunda compra |
| Preço mudou durante o checkout | Simulador (seção 6) ou `post('/api/__mock__/nfts/<slug>', { priceEth: '3.00' })` com o checkout aberto |
| Edição esgotada durante a compra | `post('/api/__mock__/nfts/<slug>', { edition: '1/50', available: 0 })` |
| Queda do tempo real | `post('/api/__mock__/socket/drop', { holdMs: 5000 })`: o cliente reconecta e reconcilia pela API |

## 6. Testar o tempo real (preço mudando durante a compra)

O **Simulador de mercado** é um painel que envia alterações de preço, disponibilidade, eventos duplicados ou antigos,
quedas de conexão e cenários de rede **pelo MSW**: a alteração muda a base simulada, o servidor Socket.IO simulado emite
`nft.updated` e o `socket.io-client` do app atualiza catálogo, detalhe, carrinho e checkout. O painel nunca escreve no
cache do app.

Fica oculto por padrão (não altera nenhum pixel do Figma). Para abri-lo:

- acrescente `?simulador=1` à URL (por exemplo, `/pagamento?simulador=1`), ou
- pressione `Ctrl+Alt+M` (de novo para fechar; `Esc` também fecha).

Passo a passo para ver o preço mudar durante uma transação:

1. Abra o app, entre como Ana, adicione um NFT ao carrinho e vá para `/pagamento`.
2. Abra o simulador (`Ctrl+Alt+M`). O NFT do carrinho já vem selecionado.
3. Clique em **+10%** (ou informe um preço e **Aplicar**).
4. A interface informa a mudança: aviso na tela, nota no item do carrinho, alerta "o preço mudou" no checkout, resumo
   atualizado e **Confirmar compra bloqueado** até o usuário clicar em **Aceitar alterações e atualizar**. Se o diálogo de
   confirmação estava aberto, ele fecha e o alerta aparece.
5. Também é possível testar **Esgotar**, **Evento duplicado**, **Evento antigo** (o app os ignora), **Segurar 20 s** (derruba
   a conexão, altere preços e depois **Reconectar agora** para ver a reconciliação pela API) e os cenários de rede.

Limitação: como cada aba tem a sua própria base simulada, o simulador age sobre a aba em que foi aberto.

## 7. Testes com Playwright

```bash
npm run test:e2e              # tudo: compila, sobe o preview e roda desktop e mobile
npx playwright test e2e/cart.spec.ts                  # um arquivo
npx playwright test -g "cupom"                        # por título
npx playwright test --project=mobile                  # só o projeto mobile
npm run test:e2e:ui           # modo interativo
npm run test:e2e:report       # relatório HTML (playwright-report/)
npx playwright show-trace test-results/<pasta-da-falha>/trace.zip   # trace de uma falha
```

- **Projetos:** `desktop` (Chromium, 1440×900) roda tudo (128 testes); `mobile` (Chromium, 390×844) roda os testes marcados com `@mobile` (90 testes). São 31 arquivos e 218 execuções, 4 delas puladas por serem exclusivas de um layout.
- **Estado isolado:** cada teste usa um contexto novo (armazenamento vazio, base semeada). Relógio, latência, falhas e eventos
  de tempo real são controlados por `page.clock`, pelos cenários e pelas rotas de controle do MSW; os eventos passam pelo
  `socket.io-client`, nunca por setters ou pelo cache.
- **Relatórios:** HTML em `playwright-report/`; traces e screenshots das falhas em `test-results/` (`trace: retain-on-failure`).
  Nenhum dos dois é versionado, porque são gerados a cada execução.
- **Servidor:** `playwright.config.ts` sempre compila e sobe um preview novo, para nunca testar um build antigo.

### 7.1 Cobertura dos 12 cenários do enunciado

| # | Cenário | Arquivos |
| --- | --- | --- |
| 1 | Busca, filtros, ordenação, paginação e histórico | `catalog`, `catalog-filters`, `catalog-states`, `mock-resilience` |
| 2 | Detalhe direto e recurso inexistente | `detail` |
| 3 | Cadastro, login, expiração, logout e troca de usuário | `auth`, `session-flows` |
| 4 | Favoritos, falha de mutation e recuperação | `favorites` |
| 5 | Carrinho, quantidades, remoção, cupom, refresh e login | `cart` |
| 6 | Compra completa até o recibo | `purchase` |
| 7 | Falha de pagamento, clique repetido, timeout e idempotência | `payment-failures`, `wallet-connection` |
| 8 | Perfil, avatar, senha e carteiras com validação | `account` |
| 9 | Preço e disponibilidade via Socket.IO durante o checkout | `realtime-price`, `market-simulator` |
| 10 | Eventos duplicados ou antigos, desconexão e pedido pendente | `realtime-resilience`, `realtime-orders`, `realtime-controls` |
| 11 | Teclado, foco de diálogos e validação | `keyboard-a11y`, `checkout-a11y`, `page-titles` |
| 12 | Skeletons, falha e nova tentativa | `loading-states`, `load-recovery`, `skeleton-layout` |

Complementares: `design-review` (os 13 comentários de revisão do Figma, um teste por correção), `visual` (regressão visual de início, detalhe, carrinho e pagamento em 1440 e 390), `responsive` (sem overflow
horizontal em 320, 390, 768 e 1440), `hero`, `tab-bar`, `modal-fit`, `fixtures-revision`.

### 7.2 Regressão visual e baselines

As baselines ficam em `e2e/__screenshots__/{projeto}/{sistema}/` e são versionadas (tolerância de 2% dos pixels, animações
desativadas, dados e relógio fixos). A renderização de texto difere entre sistemas operacionais (as alturas das páginas
variam alguns pixels), então há um conjunto para **Windows (`win32`)** e outro para **Linux (`linux`)**, este gerado com a
imagem oficial `mcr.microsoft.com/playwright` da mesma versão do `@playwright/test`. Em outro sistema (macOS, por exemplo)
os testes visuais são **pulados com uma mensagem** em vez de falhar; gere o seu conjunto com `npm run test:e2e:update`,
revise as imagens e, se quiser, versione-o. Para reproduzir as baselines Linux em qualquer máquina com Docker:

```bash
docker run --rm -v "$PWD":/src:ro mcr.microsoft.com/playwright:v1.64.1-noble bash -c 'cp -r /src /work && cd /work && npm ci && npx playwright test e2e/visual.spec.ts'
```

## 8. Auditoria Lighthouse

```bash
npm run lighthouse     # compila, sobe um servidor HTTP/2 + Brotli local e audita as duas páginas
```

Audita **início** e **detalhe do NFT**, nos perfis **mobile** (390×844, throttling simulado 4G lenta e CPU 4×) e
**desktop**, com **3 medições** por página e perfil e armazenamento limpo a cada uma, usando o build otimizado e o cenário
padrão dos mocks (latência `fast`, sem falhas). A configuração está em `lighthouse/` (`config.mjs`, `run.mjs`, `serve.mjs`);
os relatórios HTML e JSON de cada medição, o resumo `summary.json` e um índice navegável (`index.html`) ficam em
`lighthouse/reports/`. A tabela abaixo é reescrita automaticamente ao fim de cada execução.

<!-- lighthouse:start -->
Gerado em 2026-10-29T13:54:04.136Z. Mediana de 3 medições por página e perfil.

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início | mobile | 92 | 100 | 100 | 100 | 2.66 s | 0.000 | 221 ms |
| Início | desktop | 100 | 97 | 100 | 100 | 0.59 s | 0.000 | 0 ms |
| Detalhe do NFT | mobile | 94 | 100 | 100 | 100 | 2.56 s | 0.000 | 193 ms |
| Detalhe do NFT | desktop | 100 | 100 | 100 | 100 | 0.56 s | 0.000 | 0 ms |

Metas do enunciado: performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95, seo ≥ 90. Valores abaixo da meta aparecem em negrito. As medições individuais, os relatórios HTML/JSON de cada execução e o resumo estão em [`lighthouse/reports/index.html`](lighthouse/reports/index.html).

**Ambiente e condições de execução**

- Lighthouse: 13.6.0
- Servidor: HTTP/2 + Brotli (lighthouse/serve.mjs)
- Navegador: Chromium do Playwright, headless
- Índice de benchmark da CPU do host (Lighthouse): 1952 a 2386. Quanto menor, mais lenta a máquina e maior o TBT medido.
- Node: v24.21.0
- Plataforma: win32 x64
- Perfil mobile: emulação 390×844, DPR 2, throttling simulado do Lighthouse (4G lenta, CPU 4×)
- Perfil desktop: emulação 1350×940, throttling simulado do Lighthouse (rede cabeada, CPU 1×)
- Cenário dos mocks: padrão (latência `fast`, sem falhas), armazenamento limpo a cada execução
<!-- lighthouse:end -->

A análise das causas, o que foi otimizado e o que ficou abaixo da meta estão em
[ARCHITECTURE.md](ARCHITECTURE.md#13-performance-e-auditoria). A auditoria carrega as mesmas imagens, fontes e
funcionalidades da entrega: nada foi simplificado só para melhorar a pontuação.

## 9. Deploy

Aplicação estática, pronta para a Vercel (framework Vite): `vercel.json` já define o comando de build (`npm run build`), a
saída (`dist/`), a reescrita de todas as rotas para `index.html` (acesso direto e refresh funcionam) e os cabeçalhos de cache.
O service worker do MSW (`/mockServiceWorker.js`) é servido sem cache e foi ajustado para interceptar só `/api/`
(fontes, imagens e scripts passam direto); por isso o `package.json` não declara `msw.workerDirectory`, o que evita que o
`postinstall` do MSW sobrescreva o arquivo a cada instalação. Mantenha `VITE_ENABLE_MOCKS=true` (padrão) na
demonstração.

Depois do deploy, confira: acesso direto a `/nft/emerald-ape-042`, `/carrinho` e `/pagamento` com refresh; uma compra
completa; e o simulador (`?simulador=1`) alterando o preço com um item no carrinho.

## 10. Estrutura do projeto

```
src/
  app/          boot em etapas, montagem do app, providers e roteador
  components/   ui (shadcn adaptado), layout, shared, nft, feedback
  contracts/    schemas Zod (REST, eventos e cenário dos mocks)
  features/     auth, catalog, nft-detail, cart, checkout, orders, favorites, profile, wallets, realtime, market-simulator
  lib/          http, query, money, url, format, realtime, auth
  mocks/        db, handlers, scenarios, fixtures, socket (carregado só no modo de mocks)
  routes/       rotas file-based do TanStack Router
e2e/            Playwright: specs, suporte e baselines visuais
lighthouse/     configuração, servidor de auditoria, scripts de medição e relatórios
build/          plugin de build (preload por rota)
scripts/        geração e verificação das artes de NFT
```
