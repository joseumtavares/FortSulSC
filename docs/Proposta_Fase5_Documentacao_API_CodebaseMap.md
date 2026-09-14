# Proposta técnica — Fase 5: atualizar `docs/API.md` e `docs/CODEBASE_MAP.md`

**Documento preparado por:** Claude
**Data:** 14/09/2026
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção foi alterado para produzir este documento — apenas leitura do repositório.

---

## 0. Contexto

Terceiro e último gap real do checklist de fechamento da Fase 5 (cache e limite defensivo já propostos, aprovados e implementados em worktrees separadas). Este item é só documentação — não toca código de produção, então o risco é bem menor que os dois anteriores, mas ainda sigo o mesmo fluxo de proposta por ser você quem definiu tratar cada item separado.

## 1. Tamanho real do descompasso

`docs/API.md` (última revisão 21/08/2026) ainda diz *"o projeto não possui backend, banco de dados, autenticação, rotas de API"* — hoje existem **40 rotas reais** (`route.ts`) em `src/app/api`: 39 administrativas (produtos, categorias, artigos, banners, configurações institucionais, parceiros, áreas comerciais, login/logout) e 1 pública (`/api/public/partners`).

`docs/CODEBASE_MAP.md` (`last_mapped: 2026-09-07`) também está defasado: descreve o app Next.js como "Fase 2 — em andamento", só com a home estática e o WhatsApp — sem nenhuma menção ao painel administrativo, Prisma/Postgres, autenticação ou às rotas de API que já existem desde então (Fase 4 inteira e o começo da Fase 5).

## 2. Desenho proposto

### 2.1 `docs/API.md`

- Reescrever a seção 1 ("Estado atual") para refletir a realidade: Next.js + Prisma + Postgres, painel administrativo com CRUD completo, 1 rota pública.
- Substituir a seção 2 ("APIs ativas", hoje "nenhuma") por uma **tabela agrupada por recurso**, não uma ficha completa por rota (o modelo da seção 4 tem 12 campos por endpoint — aplicado às 40 rotas reais viraria um documento gigante e caro de manter, com a maior parte da informação repetida entre rotas do mesmo recurso). Formato da tabela: recurso, rotas, métodos, visibilidade, autenticação/papel exigido, arquivo-fonte. Exemplo de uma linha:

  | Recurso | Rotas | Métodos | Visibilidade | Auth |
  |---|---|---|---|---|
  | Parceiros | `/api/admin/partners`, `.../[id]`, `.../activate`, `.../deactivate`, `.../commercial-areas`, `.../logo`, `.../private` | GET/POST/PATCH conforme rota | Admin | `ADMIN`+`EDITOR` (padrão); `DELETE`/dados privados restritos a `ADMIN` |
  | Mapa de representantes | `/api/public/partners` | GET | Pública | Nenhuma — rate limit 30 req/min por IP |

- Manter a seção 4 (template detalhado de 12 campos) como está — vira o padrão para documentar **rotas novas** a partir de agora, não uma exigência retroativa para as 40 já existentes.
- Corrigir a seção 5.3 ("resposta padrão"): hoje descreve um envelope `{ data, meta }`/`{ error: { code, message } }` que **nunca foi seguido** — todas as rotas reais devolvem o corpo direto (`NextResponse.json(lista)`) e erro como `{ error: "mensagem" }` simples. Vou atualizar para documentar o padrão realmente usado, não um aspiracional que diverge do código.
- Seção 6 (exemplo ilustrativo de `/api/public/products`, "não implementado"): trocar pelo exemplo real de `/api/public/partners`, já implementado — mais útil como referência do que um exemplo fictício.

### 2.2 `docs/CODEBASE_MAP.md`

- Atualizar `last_mapped` e a seção "System Overview": o app não está mais "Fase 2 — em andamento com página placeholder" — está com painel administrativo completo (Fase 4 encerrada) e a primeira rota pública dinâmica (Fase 5 em andamento).
- Adicionar ao diagrama Mermaid um novo subgrafo cobrindo o que falta hoje: painel `/admin/**` (auth, RBAC, CRUD), a camada Prisma/Postgres, e a rota pública `/api/public/partners` + `RepresentativeMapPanel`.
- Atualizar a seção "Directory Structure" para incluir `src/app/api/**`, `src/app/admin/**`, `prisma/`.
- **Não** vou reescrever o arquivo inteiro (276 linhas) do zero — as seções sobre o site legado estático e a Fase 1 continuam corretas e não precisam mudar. O trabalho é adicionar/corrigir o que ficou defasado desde 07/09/2026, não recriar o documento.

## 3. O que preciso que você confirme

1. **Tabela agrupada por recurso em vez de ficha completa por rota** para o inventário existente (seção 2.1 acima) — de acordo, ou prefere o esforço maior de preencher o template completo das 40 rotas?
2. Nenhuma decisão de arquitetura nova aqui — é só descrever o que já existe. Só sinalizando: ao corrigir a seção 5.3, o padrão de resposta documentado passa a ser o que já está implementado (sem envelope `data`/`meta`), não uma mudança de comportamento da API.

## 4. Fluxo depois da aprovação

Edição direta dos dois arquivos na worktree isolada `.claude/worktrees/public-partners-docs` (branch `worktree-public-partners-docs`). Sem código de produção alterado, então não há `lint`/`typecheck`/testes a rodar — só revisão de conteúdo por você. Sem commit/merge/push — fica com Jose.

---

**Aguardando aprovação explícita de Jose** sobre o formato da tabela antes de reescrever os dois documentos.
