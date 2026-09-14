# Proposta técnica — Fase 5: cache de `GET /api/public/partners`

**Documento preparado por:** Claude
**Data:** 14/09/2026
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção foi alterado para produzir este documento — apenas leitura do repositório.

---

## 0. Contexto

Jose levantou um checklist de fechamento da Fase 5 (mapa e dados públicos). Conferindo contra o código real, a maior parte já está implementada (seleção explícita de campos, rate limiting antes de consultar o banco, geolocalização só no navegador, busca por cidade 100% client-side, testes de rota e repositório). Três gaps reais sobraram: **cache**, **limite defensivo/paginação** e **documentação desatualizada**. Jose pediu para tratar cada um em proposta separada e priorizar o cache agora.

## 1. Estado atual

`src/lib/content/partner-public-repository.ts`:`listPublicPartners()` consulta o Postgres via Prisma a cada chamada, sem nenhum cache. `src/app/api/public/partners/route.ts` chama essa função depois de passar pelo rate limit (30 req/min por IP, já bloqueia antes de tocar o banco quando o limite estoura). Hoje existe 1 parceiro real em produção — o ganho de performance é pequeno agora, mas Jose confirmou preferir implementar já, evitando retrabalho quando o catálogo de parceiros crescer.

## 2. Desenho proposto

**Cache TTL simples em memória, sem invalidação manual** — mesma linha que o próprio Jose sugeriu ("TTL relativamente curto, 1–5 minutos... não parece necessário que uma alteração apareça em segundos").

```ts
// src/lib/content/partner-public-repository.ts
let cache: { data: PublicPartner[]; expiresAt: number } | null = null
const CACHE_TTL_MS = 120_000 // 2 minutos

export async function listPublicPartners(): Promise<PublicPartner[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data
  const data = await fetchPublicPartners() // consulta Prisma atual, sem mudança
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS }
  return data
}
```

Por que essa forma e não `unstable_cache` do Next.js (cogitado e descartado):
- `unstable_cache` amarra o teste unitário ao runtime de cache do Next.js (não roda de forma simples isolado no Vitest, exigiria mock pesado do runtime); a forma explícita acima é testável diretamente (controlar `Date.now()`, verificar que a segunda chamada não toca o Prisma, e que expira depois do TTL).
- Nenhuma dependência nova, nenhum conceito de infraestrutura vazando para o domínio (`docs/ABSTRACTION_POLICY.md` §4: preferir a solução mais simples).
- Funciona igual em qualquer ambiente (Vercel serverless hoje, VPS/Docker amanhã — `docs/Proposta_Migracao_VPS.md`) — é só uma variável de módulo, sem depender de nenhum recurso específico de hospedagem.

**Trade-off assumido, para registrar explicitamente:** o cache é por processo/instância, não compartilhado entre réplicas (se um dia o app rodar com múltiplas instâncias, cada uma tem seu próprio cache local) e é zerado a cada cold start/deploy. Para este dataset (lista pública de parceiros, baixíssima frequência de escrita, staleness de até 2 minutos já aceita por Jose), esse é um trade-off razoável — não é uma fonte de verdade, só reduz leitura repetida do banco.

**Sem invalidação manual nas rotas administrativas.** Não vou adicionar `revalidateTag`/sinalização de cache às ~7 rotas de admin que afetam `Partner`/`CommercialArea`/municípios (criar, editar, ativar/desativar, vincular área comercial, vincular município). Isso é proposital: manter o escopo pequeno, e o próprio Jose já disse que uma edição não precisa aparecer em segundos. Se depois disso incomodar no teste manual (editar um parceiro e o mapa não refletir na hora), a saída mais simples é reduzir o TTL, não adicionar invalidação — mas registro aqui como decisão consciente, não descuido.

**Rate limiting não muda.** Continua checado antes de qualquer coisa, na própria rota — com cache quente, uma requisição permitida nem chega a tocar Prisma nem o cache-miss; com cache frio, só a primeira requisição depois de expirar paga o custo da consulta.

## 3. O que preciso que você confirme

1. **TTL de 2 minutos** (`120_000` ms) está dentro da faixa que você sugeriu (1–5 min) — confirma esse valor, ou prefere outro (ex.: 60s ou 300s)?
2. Sem invalidação manual nas rotas de admin (conforme acima) — de acordo, ou prefere que eu já adicione invalidação para refletir edições na hora?

## 4. Testes previstos

`src/lib/content/partner-public-repository.test.ts` ganha casos novos: cache hit não chama `prisma.partner.findMany` de novo dentro do TTL; expira e busca de novo depois do TTL (controlando o relógio via `vi.useFakeTimers()`, já usado em outros testes do projeto). Nenhuma mudança em `route.ts` nem nos testes de rota — o comportamento observável da API não muda, só a origem do dado (cache vs. banco).

## 5. Fluxo depois da aprovação

Implementação na worktree isolada `.claude/worktrees/public-partners-cache` (branch `worktree-public-partners-cache`), smoke tests (`lint`, `typecheck`, `npm run test:unit`), sem commit/merge/push — fica com Jose, depois do teste manual dele.

---

**Aguardando aprovação explícita de Jose** sobre o TTL e a ausência de invalidação manual antes de implementar.
