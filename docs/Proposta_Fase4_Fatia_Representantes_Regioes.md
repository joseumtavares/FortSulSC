# Proposta técnica — Fase 4, última fatia (Representantes/Revendas e Regiões geográficas: CRUD administrativo)

**Documento preparado por:** Claude
**Data:** 11/09/2026
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção, migration, schema ou dependência foi alterado para produzir este documento — apenas leitura do repositório.

---

## 0. Contexto

O objetivo original da Fase 4 (`PLANO_MESTRE_FORTSULSC.md`, linha 332) é *"dashboard interno para produtos, categorias, representantes, revendas, regiões, banners e configurações"*. Produtos, categorias, banners, configurações institucionais e artigos já têm CRUD completo. **Representantes/revendas (`Partner`) e regiões geográficas (`Region`/`State`/`Municipality`/`CommercialArea`) não têm nenhuma rota, nenhum repositório e nenhuma tela** — só o schema da Fatia 4.2 (Fase 3) existe, exercitado apenas por testes de integração.

Jose decidiu fechar essa lacuna agora, como última fatia antes de encerrar formalmente a Fase 4.

**Importante:** esta fatia é só o **painel administrativo** (cadastro/edição dos dados). A página pública do representante (mapa Leaflet + ficha do representante, botão "Encontrar representante") pertence à Fase 5, já aprovada arquiteturalmente em 30/08/2026, e não é tocada aqui.

## 1. Veredito de escopo

Cabe na **Fase 4 — Painel administrativo** (🟡), fechando o objetivo original da fase. Não remodela nenhuma tabela existente — o schema da Fatia 4.2 já cobre tudo que esta fatia precisa.

## 2. Estado real do código (verificado nesta data)

- `Partner` (`prisma/schema.prisma`): `type` (`REPRESENTATIVE`/`RESELLER`), `name`, `description`, `whatsapp`, `socialLinks` (Json), `websiteUrl`, `logoUrl`, `active` (nasce `false`), `approximateLat`/`approximateLng`. Relação opcional 1:1 com `PartnerPrivate` e N:N com `CommercialArea` via `PartnerCommercialArea`.
- `PartnerPrivate`: `document`, `consentGivenAt` (obrigatório), `consentRevokedAt`, `consentNotes` — dados sensíveis (LGPD), fisicamente separados de `Partner` desde a Fatia 4.2 exatamente para permitir seleção explícita de campos públicos (`CLAUDE.md` §14). RLS + política restrita a `fortsul_app` já aplicada (achado da varredura de hoje).
- `Region` → `State` → `Municipality`: hierarquia geográfica oficial do Brasil, cada nível com `ibgeCode` único. `CommercialArea` é uma agrupação **de negócio** (não oficial) de municípios, ligada por `CommercialAreaMunicipality`.
- **Nenhum dado de geografia existe hoje** — nem no banco local, nem em produção, nem em `prisma/seed.ts`. Nenhuma das ~5.570 combinações de região/estado/município do Brasil está cadastrada.
- Nenhum repositório (`*-repository.ts`), rota (`src/app/api/admin/partners/**` ou `.../regions/**`) ou tela (`/admin/partners`, `/admin/regions`) existe.
- Padrões prontos para reaproveitar sem alteração: `requireAdminRequest` + `recordAuditEvent` + `revalidatePath`, `parseSocialLinks` (`src/lib/content/social-links.ts`, já usado por `InstitutionalSettings`), `CharCounter`/`text-limits.ts` (Fatia de hoje), `ProductCategoriesForm` como modelo de formulário de vínculo N:N (checklist), `getImageStorage()`/`image-signature.ts` se `logoUrl` virar upload em vez de link.

## 3. Decisão crítica de arquitetura — como popular a geografia

Isto **precisa ser decidido antes de desenhar as telas**, porque muda o formato da fatia inteira.

`Region`/`State`/`Municipality` são uma hierarquia geográfica **oficial e fixa** (a divisão político-administrativa do IBGE não muda por decisão do admin do site). Criar um formulário genérico de "criar/editar região, estado, município" para o admin preencher à mão é impraticável: são 5 regiões, 27 estados e **5.570 municípios** — ninguém digita isso um por um num formulário, e qualquer erro de digitação no `ibgeCode` quebra a integridade dos dados.

Proposta: tratar `Region`/`State`/`Municipality` como **dado de referência, semeado uma única vez** por um script (`prisma/seed-geography.ts` ou similar), a partir da lista oficial do IBGE — sem tela de criar/editar/excluir no painel para esses três níveis (no máximo, uma tela **somente leitura** de consulta, se for útil para escolher municípios ao montar uma área comercial). O que **é** genuinamente admin-editável é `CommercialArea`: um agrupamento de negócio ("Grande Florianópolis", "Vale do Itajaí" etc.) que o admin cria e associa a um conjunto de municípios — isso sim precisa de CRUD completo.

### 3.1 Pergunta que precisa da sua resposta

- **Semear todos os ~5.570 municípios do Brasil, ou só os estados/municípios onde a FortSul realmente atua hoje** (ex.: só Santa Catarina + estados vizinhos)? Semear o Brasil inteiro é mais completo e à prova de expansão futura, mas é uma lista de dados bem maior para eu validar/higienizar antes de aplicar; semear só a região de atuação atual é mais rápido de entregar e mais fácil de conferir, com o custo de precisar rodar o seed de novo (ou complementar manualmente) se a empresa expandir para um estado novo.

## 4. Escopo técnico proposto

### 4.1 Repositórios novos
- `commercial-area-repository.ts`: CRUD de `CommercialArea` + vínculo com municípios (mesmo padrão de `setProductApplications`/`setProductSpecifications` — substituir lista inteira).
- `region-repository.ts` (ou `geography-repository.ts`): consultas somente-leitura de `Region`/`State`/`Municipality` (para popular selects/checklists nas telas de área comercial e parceiro), sem rotas de escrita.
- `partner-repository.ts`: CRUD de `Partner` (+ `PartnerPrivate` quando aplicável) + vínculo com `CommercialArea`.

### 4.2 Rotas administrativas novas
- `POST/PATCH /api/admin/commercial-areas[/[id]]`, `PUT /api/admin/commercial-areas/[id]/municipalities` (substituir lista).
- `POST/PATCH/DELETE /api/admin/partners[/[id]]`, `POST /api/admin/partners/[id]/activate|deactivate`, `PUT /api/admin/partners/[id]/commercial-areas`, e rotas para `PartnerPrivate` (`PUT /api/admin/partners/[id]/private`) quando o parceiro for pessoa física com consentimento.
- Todas seguindo `requireAdminRequest` + `recordAuditEvent`; **sem** `revalidatePath('/')` nesta fatia (não existe rota pública consumindo esses dados ainda — isso é Fase 5).

### 4.3 Telas administrativas novas
- `/admin/commercial-areas` (lista/criar/editar) — form de nome + checklist de municípios (por estado, como um `<select>` em cascata Estado → Municípios, reaproveitando o padrão de `ProductCategoriesForm`).
- `/admin/partners` (lista/criar/editar) — form principal (`type`, nome, descrição, WhatsApp, redes sociais, site, logo, coordenadas aproximadas) + sub-formulário de áreas comerciais vinculadas + sub-formulário de dados privados (documento + consentimento) quando `type = REPRESENTATIVE` ou quando o parceiro for pessoa física.

### 4.4 Contrato de testes
Testes unitários para cada `*-input.ts` novo (mesmo padrão de `product-input.test.ts`), testes de rota com mocks (mesmo padrão dos demais `route.test.ts`), e um teste de integração novo cobrindo o fluxo real contra Postgres (criação de área comercial → vínculo de municípios → criação de parceiro → vínculo de área comercial → exclusão em cascata), complementando os testes já existentes em `fatia-4-2.integration.test.ts`.

## 5. Fora de escopo desta fatia
- Página pública do representante, mapa Leaflet, botão "Encontrar representante" (Fase 5).
- Qualquer seleção de campos públicos vs. privados de `Partner`/`PartnerPrivate` para consulta pública (Fase 5 — é o pré-requisito já registrado no Plano Mestre).
- Tela de criar/editar/excluir `Region`/`State`/`Municipality` (dado de referência semeado, ver seção 3).

## 6. Riscos de segurança, privacidade e LGPD
- `PartnerPrivate` guarda documento e consentimento — a tela de edição deve deixar claro que esses campos nunca aparecem em nenhuma consulta pública (já garantido pela separação física de tabela + RLS restrita a `fortsul_app`).
- `approximateLat`/`approximateLng`: `CLAUDE.md` §14 exige que coordenadas de representante pessoa física sejam aproximadas. Proposta: o formulário aceita coordenadas exatas digitadas/coladas pelo admin, mas o servidor **arredonda automaticamente** para ~1km de precisão (2 casas decimais) antes de salvar — não depende de disciplina manual de quem preenche.
- Exclusão física de `Partner`: dado o precedente já aprovado para `Product` (exclusão física + confirmação explícita), proponho o mesmo padrão aqui, mas **fica como decisão a confirmar** (seção 7) — parceiros/representantes são dados de pessoas/empresas reais, com implicação LGPD diferente de um produto.

## 7. Decisões que exigem aprovação explícita de Jose antes de implementar

1. **Geografia**: semear o Brasil inteiro (~5.570 municípios) ou só a região de atuação atual (seção 3.1)?
2. **Exclusão de parceiro**: física (como produto) ou só desativar (como artigo/banner)? Se física, precisa de confirmação explícita por parceiro (mesmo padrão do produto) dado que é dado de pessoa/empresa real.
3. **Dados privados (`PartnerPrivate`)**: preenchidos no mesmo formulário do parceiro, ou como uma etapa/tela separada (mais deliberada, evita preencher documento/consentimento sem perceber)?
4. **Logo do parceiro**: link de imagem (texto simples, como hoje `websiteUrl`) ou upload de arquivo (como produto/artigo/banner, com `image-signature.ts` aplicado)?
5. **Coordenadas**: confirma o arredondamento automático no servidor (~1km) proposto na seção 6, ou prefere outro nível de aproximação?

## 8. Decisões confirmadas por Jose em 11/09/2026

1. **Geografia**: semear só a Região Sul (PR, SC, RS) — não o Brasil inteiro. Se a empresa expandir para outro estado, o seed roda de novo ou é complementado manualmente.
2. **Exclusão de parceiro**: física, com confirmação explícita — mesmo padrão já aprovado para `Product` (restrita à role `ADMIN`, dado tratar-se de dado de pessoa/empresa real).
3. **Dados privados (`PartnerPrivate`)**: no mesmo formulário do parceiro (não em etapa/tela separada).
4. **Logo do parceiro**: upload de arquivo, mesmo padrão de produto/artigo/banner (`image-signature.ts` validando os bytes reais).
5. **Coordenadas**: confirmado o arredondamento automático no servidor para ~1km de precisão (2 casas decimais), sempre aplicado independente do que foi digitado.

Implementado nesta mesma sessão, na `main` (checkout principal, sem worktree nova, seguindo o mesmo padrão direto já usado nas correções desta sessão): migration `20260912000000_fase4_partners_regioes_admin` (novo valor de enum `COMMERCIAL_AREA` em `AuditEntityType`; `Partner.logoKey` para rastrear o arquivo de storage da logo, mesmo padrão de `Banner.imageKey`); `prisma/data/geografia-sul.json` com dados reais da API pública do IBGE (1.191 municípios de PR/SC/RS) semeados via `prisma/seed.ts`; repositórios `region-repository.ts` (somente leitura), `commercial-area-repository.ts` e `partner-repository.ts`; validação `commercial-area-input.ts`, `partner-input.ts` e `partner-private-input.ts`; rotas administrativas completas (`/api/admin/commercial-areas/**`, `/api/admin/partners/**`, com `DELETE /api/admin/partners/[id]` restrito a `ADMIN`); telas `/admin/commercial-areas` e `/admin/partners/representantes|revendas` (rotas por caminho, não por query string, para o destaque de navegação do menu funcionar corretamente); navegação do painel (`nav-items.ts`) atualizada, removendo o badge fictício que existia desde a criação do componente. Nenhuma rota pública foi criada — a exibição pública (mapa de representantes) permanece na Fase 5. `lint`, `typecheck`, `npm run test:unit` (499 testes) e `npm run test:db` (57 testes, incluindo 4 novos cobrindo o seed de geografia real e o fluxo completo de parceiro + área comercial contra Postgres real) aprovados. `scope-gate-reviewer` e `ui-reviewer` executados antes do commit — ver o registro completo dos achados corrigidos em `docs/PLANO_MESTRE_FORTSULSC.md`, entrada de 11/09/2026.
