# Kurio — Marketplace de NFTs

Solução do desafio de front-end: descoberta, compra e conta do colecionador, em desktop, tablet e mobile, com API,
autenticação, carteiras, pagamentos e tempo real **simulados na camada de rede** (MSW + Socket.IO).

React 19 · TypeScript 5.9 · TanStack Router e Query · Axios · Socket.IO · Tailwind v4 · shadcn/ui (Radix) · MSW ·
Playwright · Lighthouse.

Documentação: [arquitetura e decisões](docs/ARCHITECTURE.md) · [contratos REST e eventos](docs/api-contracts.md) ·
[enunciado](docs/CHALLENGE.md) · [resultados do Lighthouse](lighthouse/RESULTS.md) · [andamento](PROGRESS.md).

## Setup

Requer Node 20 ou superior (testado com Node 24).

```bash
npm install
npx playwright install chromium
npm run dev
```

A aplicação sobe em http://localhost:5173 já com os mocks ativos. Não há backend, serviço privado nem variável obrigatória.

## Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Desenvolvimento com mocks (Vite) |
| `npm run build` | Gera as rotas, confere os tipos e compila para `dist/` |
| `npm run preview` | Serve o build (mocks incluídos) em http://localhost:4173 |
| `npm run typecheck` | Rotas + `tsc -b` |
| `npm run lint` | oxlint |
| `npm run format` / `format:check` | Prettier |
| `npm run test:e2e` | Playwright: compila, sobe o preview e roda desktop e mobile |
| `npm run test:e2e:report` | Abre o relatório HTML do último teste |
| `npm run lighthouse` | Compila e audita início e detalhe (3 medições, mobile e desktop) |
| `npm run art` | Regenera as variantes otimizadas das artes de NFT |

## Variáveis de ambiente

| Variável | Padrão | Efeito |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` | `false` desliga o MSW e envia as chamadas a um backend real em `/api`. O build de demonstração deve manter `true` |

Há um `.env.example` na raiz.

## Credenciais fictícias

| Usuário | E-mail | Senha |
| --- | --- | --- |
| Ana Ribeiro (principal e secundária cadastradas, 3 favoritos) | `ana@kurio.test` | `kurio-ana-2026` |
| Bruno Carvalho (sem favoritos) | `bruno@kurio.test` | `kurio-bruno-2026` |

Cupons: `KURIO10` (10%), `PRIMEIRACUNHAGEM` (0.05 ETH), `EXPIRADO` e `VENCIDO30` (vencidos). Qualquer outro código é
inválido.

## Cenários dos mocks

Os cenários são determinísticos: nada usa aleatoriedade, e a latência variável vem de um gerador semeado. Podem ser
escolhidos pela query string (vence sobre tudo e vale só para aquele carregamento) ou em tempo de execução.

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

### Console do navegador

As rotas de controle ignoram a simulação de rede e funcionam com a aplicação aberta:

```js
const post = (path, body = {}) =>
  fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

post('/api/__mock__/reset')                                            // restaura o cenário semeado
post('/api/__mock__/scenario', { payment: 'decline' })                 // altera o cenário
post('/api/__mock__/expire-sessions')                                  // expira todas as sessões
post('/api/__mock__/nfts/emerald-ape-042', { priceEth: '2.00' })       // muda o preço e emite nft.updated
post('/api/__mock__/nfts/emerald-ape-042', { edition: '1/50', available: 1 })
post('/api/__mock__/socket/drop')                                      // derruba o Socket.IO
```

**Reset completo**: `POST /api/__mock__/reset` ou apagar o `localStorage` do site (a base é persistida ali) e recarregar.

## Reproduzindo os fluxos de falha

| Fluxo | Como reproduzir |
| --- | --- |
| Lentidão e skeletons | `/?latency=slow` |
| Respostas fora de ordem | `/?latency=out-of-order` e trocar de página rápido |
| Erro HTTP e nova tentativa | `/?failure=server-error&failScope=/api/nfts`; depois `post('/api/__mock__/scenario', { failure: 'none', scope: [] })` e **Tentar novamente** |
| Sem conexão | `/?failure=offline` |
| Sessão expirada | Entre, rode `expire-sessions` e navegue ou recarregue |
| Cupom inválido ou expirado | Use `NAOEXISTE` e `EXPIRADO` no carrinho |
| Pagamento recusado | `post('/api/__mock__/scenario', { payment: 'decline' })` e conclua a compra |
| Carteira recusa a conexão | `post('/api/__mock__/scenario', { wallet: 'reject' })` |
| Timeout após criar o pedido | `post('/api/__mock__/scenario', { orderTimeout: true })`; após ~8 s use **Tentar novamente** ou **Verificar pedido**: volta o mesmo pedido |
| Preço mudou durante o checkout | Com o checkout aberto: `post('/api/__mock__/nfts/<slug>', { priceEth: '3.00' })` |
| Queda do tempo real | `post('/api/__mock__/socket/drop')` (o cliente reconecta e reconcilia) |

## Tempo real

O cliente é um `socket.io-client` real; o servidor Socket.IO é simulado dentro do MSW por `@mswjs/socket.io-binding`.
`nft.updated` atualiza catálogo, detalhe e carrinho; `order.updated` atualiza o pedido. Eventos duplicados, antigos ou de
outro usuário são descartados. Detalhes, restrições do transporte e a política de reconciliação estão em
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) §2 e §9.

## Testes e auditoria

- `npm run test:e2e`: 17 arquivos de teste cobrindo os 12 cenários do enunciado, mais responsividade e regressão visual
  (início, detalhe, carrinho e pagamento) em desktop 1440 e mobile 390. Relatório em `playwright-report/`.
- `npm run lighthouse`: mediana de 3 medições por página e perfil, com relatórios HTML/JSON em `lighthouse/reports/`.

## Deploy

Aplicação estática, pronta para a Vercel (`vercel.json` já reescreve todas as rotas para `index.html`, então acesso direto e
refresh funcionam). Build: `npm run build`; saída: `dist/`. Mantenha `VITE_ENABLE_MOCKS=true` para a demonstração.

## Estrutura

```
src/
  app/          providers, router, tokens de estilo
  components/   ui (shadcn adaptado), layout, shared, nft, feedback, icons
  contracts/    schemas Zod (REST e eventos)
  features/     auth, catalog, nft-detail, cart, checkout, orders, favorites, profile, wallets, realtime
  lib/          http, query, money, url, format, realtime, auth
  mocks/        db, handlers, scenarios, fixtures, socket (carregado só no modo de mocks)
  routes/       rotas file-based do TanStack Router
e2e/            Playwright (specs, suporte e baselines visuais)
lighthouse/     configuração, servidor de auditoria, relatórios
docs/           arquitetura, contratos, enunciado
```
