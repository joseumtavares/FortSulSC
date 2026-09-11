# Proposta técnica — Fase 4, Fatia 3 (Banners + Configurações Institucionais: rotas, CRUD e UI)

**Documento preparado por:** Claude
**Data:** 10/09/2026
**Destinatário:** Codex (agente responsável pela implementação desta fatia)
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção, migration, schema ou dependência foi alterado para produzir este documento — apenas leitura do repositório e dos documentos de governança.

---

## 0. Como usar este documento

Este arquivo é o handoff que Jose está enviando ao Codex para implementar a
Fatia 3 da Fase 4. Antes de escrever qualquer código, o Codex deve:

1. ler `docs/PLANO_MESTRE_FORTSULSC.md` inteiro (fonte de verdade de fase/escopo);
2. ler `CLAUDE.md`, `docs/RULES.md`, `docs/CHECKLIST.md`, `docs/ABSTRACTION_POLICY.md`;
3. confirmar o estado real do repositório (`git status --short --branch`, `git log --oneline -10`) — não presumir que este documento já reflete commits feitos depois de 10/09/2026;
4. seguir o fluxo de duas camadas da seção 4 da Parte I do Plano Mestre: esta proposta ainda precisa da aprovação explícita do Jose sobre os pontos da seção 11 abaixo, e da revisão técnica do Claude após a implementação, **antes** de qualquer commit;
5. nunca abrir `.env`, `.env.local`, tokens, credenciais, chaves ou connection strings;
6. nunca fazer commit, merge ou push — isso é conduzido só pelo Jose, conforme `CLAUDE.md` §10 e §13.

Se o Codex encontrar qualquer divergência entre este documento e o código real (por exemplo, um arquivo já modificado por outra tarefa), deve parar e reportar a divergência antes de prosseguir, em vez de decidir sozinho qual lado está certo.

---

## 1. Veredito de escopo

Esta tarefa cabe na **Fase 4 — Painel administrativo** (🟡, `docs/PLANO_MESTRE_FORTSULSC.md` seção 0.2), que já está formalmente aberta desde 08/09/2026 e já teve duas fatias implementadas (design system do painel + estrutura base; CRUD de artigos/galeria/Novidades públicas). Esta é a **Fatia 3** da Fase 4.

O schema de dados já existe por inteiro desde a Fatia 4.5 (Fase 3), aprovada e commitada — `Banner` e `InstitutionalSettings` em `prisma/schema.prisma`, com repositórios mínimos (`src/lib/content/banner-repository.ts`, `src/lib/content/institutional-settings-repository.ts`) já testados. Esta fatia **não remodela dado nenhum**: adiciona só a camada de rota HTTP administrativa e a tela de painel que consome esses repositórios — o mesmo padrão já usado para `Article` na fatia anterior.

Nenhuma regra de negócio nova de peso é introduzida, com uma exceção pontual: a validação do formato de `socialLinks` (JSON) precisa de uma decisão explícita de forma (seção 5.4) porque hoje o campo é `Json?` sem nenhuma validação de formato em nenhum lugar do código.

## 2. Estado real do código (verificado nesta data)

- `git status --short --branch`: `main` local = `origin/main`, sem pendência de push.
- `prisma/schema.prisma`: `Banner` e `InstitutionalSettings` já existem exatamente como descritos abaixo; `AuditEntityType` já contém `BANNER` e `INSTITUTIONAL_SETTINGS`; `AuditAction` contém `CREATE`, `UPDATE`, `PUBLISH`, `UNPUBLISH`, `DEACTIVATE`, `DELETE` — **`DEACTIVATE` existe desde a Fatia 4.4 mas nunca foi usado em código**, o que indica que já foi reservado antecipadamente para este exato caso (banner ativo/inativo). Não existe `ACTIVATE` no enum (ver decisão 5.1).
- `src/lib/content/banner-repository.ts` já expõe `createBanner` (força `active: false` na criação), `findActiveBannersPublic` (consulta pública, filtra janela de datas), `findBannerForAdmin(id)` e `updateBanner(id, input)` (aceita alterar `active`). **Falta** uma função de listagem administrativa (`listBannersForAdmin`) — nenhuma rota/tela pode listar todos os banners (ativos e inativos) sem ela.
- `src/lib/content/institutional-settings-repository.ts` já expõe `getInstitutionalSettings()` e `upsertInstitutionalSettings(input)`. Nenhuma validação de formato existe para `socialLinks`.
- Nenhuma rota `src/app/api/admin/banners/**` ou `src/app/api/admin/institutional-settings/**` existe.
- Nenhuma tela `src/app/admin/(dashboard)/banners/**` ou `.../settings/**` existe.
- `src/components/admin/nav-items.ts` já reserva as entradas `banners` (ícone `ImageIcon`) e `configuracoes` (ícone `Settings`), mas **sem `href`** — hoje são botões inertes que só mudam um estado local (`selected`) sem navegar a lugar nenhum, diferente de `dashboard`/`artigos`, que já têm `href` real.
- Padrões prontos para reaproveitar sem alteração:
  - `src/lib/auth/admin-route-guard.ts` (`requireAdminRequest`): origem + sessão + RBAC (`ADMIN`/`EDITOR` por padrão) em uma linha, já usado por todas as rotas de artigo (exceto login/logout/cover, que são anteriores a este guard).
  - `src/lib/audit/audit-log-repository.ts` (`recordAuditEvent`): grava auditoria sem texto livre, exatamente o padrão exigido desde a Fatia 4.4.
  - `src/lib/storage/image-storage.ts` (`getImageStorage()`): abstração trocável local/R2/Supabase, mesma usada na capa e na galeria de artigo — `upload({ key, body, contentType })` e `delete(key)`.
  - `src/app/api/admin/articles/[id]/cover/route.ts`: template de upload de imagem via `multipart/form-data` com validação de MIME/tamanho, geração de `key`, exclusão da imagem antiga após sucesso.
  - `src/app/admin/(dashboard)/articles/page.tsx` + `.../[id]/page.tsx`: template de lista administrativa e tela de edição dentro do `AdminShell`.

## 3. Escopo técnico proposto

### 3.1 Extensão de repositório (sem schema novo)

`src/lib/content/banner-repository.ts` ganha:

```ts
export function listBannersForAdmin() {
  return prisma.banner.findMany({ orderBy: [{ active: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }] })
}
```

Nenhuma outra função nova é necessária: `updateBanner(id, { active: true })` / `updateBanner(id, { active: false })` já cobrem ativar/desativar; `updateBanner(id, { title, linkUrl, altText, startAt, endAt })` já cobre a edição de texto; `updateBanner(id, { imageUrl, imageKey, mimeType, size })` já cobre a troca de imagem.

### 3.2 Extensão de schema — `AuditAction.ACTIVATE` (requer aprovação explícita, ver seção 11.1)

```prisma
enum AuditAction {
  CREATE
  UPDATE
  PUBLISH
  UNPUBLISH
  ACTIVATE   // novo — simétrico ao DEACTIVATE já reservado na Fatia 4.4
  DEACTIVATE
  DELETE
}
```

Migration puramente aditiva (`ALTER TYPE "AuditAction" ADD VALUE 'ACTIVATE'`), sem alterar dado existente. Esta é a única alteração de schema desta fatia.

### 3.3 Rotas administrativas — Banners

Todas usam `requireAdminRequest` (guard compartilhado) e `recordAuditEvent` após sucesso, seguindo byte a byte o padrão das rotas de artigo.

| Rota | Método | Corpo | Ação |
|---|---|---|---|
| `/api/admin/banners` | `GET` | — | `listBannersForAdmin()` |
| `/api/admin/banners` | `POST` | `multipart/form-data` (`title`, `linkUrl?`, `altText`, `startAt?`, `endAt?`, `file`) | Cria banner **já com imagem** (ver 5.2: banner nunca existe sem imagem, diferente de artigo) via `getImageStorage().upload` + `createBanner`. Audita `CREATE`/`BANNER`. |
| `/api/admin/banners/[id]` | `PATCH` | JSON (`title`, `linkUrl`, `altText`, `startAt`, `endAt`) | `updateBanner(id, {...})`, sem tocar em imagem/`active`. Audita `UPDATE`/`BANNER`. |
| `/api/admin/banners/[id]/image` | `POST` | `multipart/form-data` (`file`) | Substitui a imagem (mesmo padrão de `articles/[id]/cover`: nova key, `updateBanner`, exclui key antiga). Audita `UPDATE`/`BANNER`. |
| `/api/admin/banners/[id]/activate` | `POST` | — | `updateBanner(id, { active: true })`. Audita `ACTIVATE`/`BANNER`. |
| `/api/admin/banners/[id]/deactivate` | `POST` | — | `updateBanner(id, { active: false })`. Audita `DEACTIVATE`/`BANNER`. |

Sem `DELETE` — ver decisão 5.3.

### 3.4 Rotas administrativas — Configurações institucionais

| Rota | Método | Corpo | Ação |
|---|---|---|---|
| `/api/admin/institutional-settings` | `GET` | — | `getInstitutionalSettings()` (pode retornar `null` na primeira vez — a UI trata como formulário vazio). |
| `/api/admin/institutional-settings` | `PUT` | JSON (`whatsapp`, `phone?`, `email`, `cnpj?`, `address?`, `socialLinks?`) | Valida `socialLinks` (seção 5.4) e chama `upsertInstitutionalSettings`. Audita `UPDATE`/`INSTITUTIONAL_SETTINGS` com `entityId` = id da linha singleton. |

Sem `POST`/`DELETE` — é sempre a mesma linha (`singletonKey = 1`).

### 3.5 UI do painel

- `src/app/admin/(dashboard)/banners/page.tsx` — lista (mesma estrutura de tabela de `articles/page.tsx`): miniatura da imagem, título, status (badge "Ativo"/"Inativo", mesmo padrão visual do badge de artigo publicado/rascunho), janela de agendamento formatada, link para edição. Botão "Novo banner".
- `src/app/admin/(dashboard)/banners/novo/page.tsx` — formulário único (título, link, texto alternativo, datas de início/fim, arquivo de imagem) que envia tudo de uma vez para `POST /api/admin/banners` (banner nasce com imagem, não em duas etapas como artigo).
- `src/app/admin/(dashboard)/banners/[id]/page.tsx` — tela de edição: formulário de texto (`PATCH`), componente de troca de imagem (mesmo padrão de `ArticleCoverUploadForm`, adaptado), botão ativar/desativar (mesmo padrão do checkbox único reaproveitável de publicar/despublicar do artigo).
- `src/app/admin/(dashboard)/settings/page.tsx` — formulário único: WhatsApp, telefone, e-mail, CNPJ, endereço, e um grupo de campos para redes sociais (Facebook/Instagram/LinkedIn/YouTube — ver 5.4). Sem lista, sem "novo" — é sempre a mesma configuração.

### 3.6 Navegação

`src/components/admin/nav-items.ts`: os itens `banners` e `configuracoes` ganham `href: '/admin/banners'` e `href: '/admin/settings'`, no mesmo formato já usado por `dashboard` e `artigos` (isso os transforma de botão inerte em link real — nenhuma outra mudança nesse arquivo).

## 4. Contrato de testes (antes do código de regra de negócio, `PLANO_MESTRE_FORTSULSC.md` seção 4)

Seguir exatamente a cobertura já usada nas rotas de artigo — um `route.test.ts` ao lado de cada `route.ts`, mais os testes de repositório:

- `src/lib/content/banner-repository.test.ts` — adicionar caso para `listBannersForAdmin` (ordena por `active desc, order asc, createdAt desc`).
- `src/app/api/admin/banners/route.test.ts` — `GET` lista todos (ativos e inativos); `POST` rejeita sem guard, rejeita MIME/tamanho inválido, rejeita sem `altText`, cria com `active: false`, audita `CREATE`.
- `src/app/api/admin/banners/[id]/route.test.ts` — `PATCH` 404 se não existe, atualiza campos de texto, audita `UPDATE`.
- `src/app/api/admin/banners/[id]/image/route.test.ts` — mesmo roteiro do teste de capa de artigo (MIME/tamanho, substituição, exclusão da imagem antiga).
- `src/app/api/admin/banners/[id]/activate/route.test.ts` e `.../deactivate/route.test.ts` — 404, sucesso, auditoria com a ação correta (`ACTIVATE`/`DEACTIVATE`).
- `src/lib/content/institutional-settings-repository.test.ts` — adicionar teste da função de validação de `socialLinks` (seção 5.4) rejeitando URL fora do domínio esperado e aceitando `undefined`/omitido.
- `src/app/api/admin/institutional-settings/route.test.ts` — `GET` retorna `null` quando não configurado ainda; `PUT` valida e-mail, rejeita `socialLinks` malformado, faz upsert idempotente, audita `UPDATE`.

Todos os arquivos de rota nova devem ter teste antes de serem considerados prontos, no mesmo padrão de `docs/RULES.md` §11.1.

## 5. Decisões de negócio adotadas nesta proposta (com justificativa)

### 5.1 `AuditAction.ACTIVATE` — adicionar ao enum

`DEACTIVATE` já foi reservado na Fatia 4.4 sem nenhum consumidor até hoje — o único candidato razoável no schema atual é exatamente `Banner.active`. Manter só `DEACTIVATE` e reaproveitar `UPDATE` para ativação criaria uma trilha de auditoria assimétrica (dá para saber quando um banner foi desativado, mas não quando foi ativado, sem abrir o `UPDATE` genérico). Recomendo adicionar `ACTIVATE`. **Isso é uma alteração de schema — precisa da aprovação explícita do Jose antes do Codex gerar a migration** (seção 11.1).

### 5.2 Banner nunca existe sem imagem (criação atômica)

Diferente de `Article` (que nasce em rascunho, sem capa, e só exige imagem para *publicar*), o schema de `Banner` já define `imageUrl`/`imageKey`/`mimeType`/`size`/`altText` como campos obrigatórios (não anuláveis) desde a Fatia 4.5. Não há "banner rascunho sem imagem" possível no banco atual. Por isso a criação precisa ser um único `POST` multipart com todos os campos, em vez do fluxo em duas etapas do artigo. Isso não é uma escolha desta proposta — é uma consequência direta do schema já aprovado.

### 5.3 Sem exclusão de banner

Seguindo o mesmo princípio já aprovado para `Article` ("sem exclusão de artigo, publicar/despublicar via caixa de seleção única reaproveitável"), esta proposta assume que banner também não deve ser fisicamente excluído — só desativado. Isso preserva o histórico de auditoria e evita órfãos de storage. **Fica como decisão a confirmar na seção 11.2**, já que não há uma resposta explícita de Jose especificamente sobre banners (a decisão sobre artigos foi específica de artigos).

### 5.4 Formato de `socialLinks`

Hoje `socialLinks: Json?` não tem nenhuma validação em nenhum model (nem em `Partner`, que já tem o mesmo campo). Proposta mínima para não travar esta fatia: um formato fixo, todos os campos opcionais, sempre string de URL `https://` ou ausente/`null`:

```ts
export type SocialLinks = {
  facebook?: string
  instagram?: string
  linkedin?: string
  youtube?: string
}
```

Validação server-side (`parseSocialLinks`, novo arquivo `src/lib/content/social-links.ts`): rejeita qualquer chave fora dessas quatro, rejeita valor que não comece com `https://`, aceita objeto vazio ou ausente. Isso é uma regra de negócio nova pequena — o contrato de teste da seção 4 cobre isso antes da implementação, conforme exigido a partir da Fase 3. **Fica como decisão a confirmar na seção 11.3** (a lista de redes sociais pode não ser exatamente essas quatro).

### 5.5 Banner `active` é kill switch absoluto sobre a janela de datas

`findActiveBannersPublic()` já implementado exige `active: true` **e** dentro da janela de `startAt`/`endAt` — ou seja, o comportamento "desativar sempre esconde, mesmo dentro do período agendado" já é o comportamento real do código desde a Fatia 4.5. Esta fatia não muda essa regra, só constrói a UI para controlá-la.

### 5.6 Mais de um banner pode ficar ativo ao mesmo tempo

`findActiveBannersPublic()` já retorna todos os banners ativos dentro da janela, ordenados por `order` (sem limitar a um só). Esta fatia mantém esse comportamento — a UI não impõe um limite artificial de "um banner ativo por vez". Se Jose quiser essa restrição, é uma regra de negócio nova a decidir separadamente (não incluída aqui).

## 6. Critérios de aceite

1. `GET /api/admin/banners` lista banners ativos e inativos; `POST` cria só com imagem, MIME (`jpeg`/`png`/`webp`) e tamanho (≤5 MB) validados, nasce `active: false`.
2. `PATCH /api/admin/banners/[id]` nunca altera `active`, `imageUrl`, `imageKey`, `mimeType` ou `size`.
3. `POST /api/admin/banners/[id]/image` exclui a imagem antiga do storage só após o banco confirmar a nova (mesma ordem já usada na capa de artigo).
4. `activate`/`deactivate` só alteram `active`; nunca tocam em imagem ou texto.
5. Nenhuma rota aceita requisição sem sessão administrativa válida (`ADMIN`/`EDITOR`) e origem válida — testado com o mesmo padrão de `articles/route.test.ts`.
6. `GET /api/admin/institutional-settings` retorna `null` quando a tabela está vazia (não lança erro).
7. `PUT /api/admin/institutional-settings` rejeita `socialLinks` com chave desconhecida ou URL que não comece com `https://`.
8. `/admin/banners` e `/admin/settings` navegáveis pela sidebar (itens deixam de ser inertes).
9. `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:db` e `npm run build` aprovados.
10. Nenhum segredo, dado pessoal ou valor de ambiente registrado em código, migration ou documentação desta fatia.
11. Nenhuma consulta pública nova foi criada ou alterada (banners continuam sem consumidor público — fora de escopo, seção 7).

## 7. Fora de escopo

- Exibição pública de banners na Home ou em qualquer página (`findActiveBannersPublic` já existe, mas nenhuma fatia até agora tem consumidor público — fica para uma fatia futura, análoga ao que foi feito com "Novidades e dicas" depois do CRUD de artigos).
- Reordenação manual de banners (`order` fica só editável via seed/SQL nesta fatia; drag-and-drop fica para depois, se necessário).
- Qualquer alteração em `Partner.socialLinks` (mesmo campo, mesmo formato sugerido, mas fora do escopo desta fatia — `Partner` pertence à Fatia 4/5 de parceiros, não a esta).
- Exclusão física de banner (ver 5.3).
- Qualquer trabalho de Produtos/Categorias ou Representantes/Revendas (Fatias separadas da Fase 4, não agrupadas aqui — ver a proposta enviada ao Jose sobre a divisão em opções A/B/C).
- Atualização major do Prisma (trilha técnica independente, já registrada como pendência separada).

## 8. Riscos de segurança, privacidade e LGPD

- **Nenhum dado pessoal**: `Banner` e `InstitutionalSettings` guardam dado institucional/comercial público (mesma categoria de `Product`/`Category`), não dado de pessoa física. Nenhum risco de LGPD novo.
- **Upload de imagem**: reaproveita a validação já aprovada (MIME allowlist, limite de 5 MB, `alt` obrigatório) — nenhuma superfície de ataque nova além da já existente em `articles/[id]/cover`.
- **`socialLinks` como JSON**: sem a validação da seção 5.4, o campo aceitaria qualquer estrutura arbitrária vinda do formulário administrativo — a validação evita que o campo vire um vetor de armazenamento de dado não previsto (mesmo que só admin/editor autenticado possa escrevê-lo).
- **RBAC**: todas as rotas exigem `ADMIN` ou `EDITOR` via `requireAdminRequest`, igual às rotas de artigo — nenhum papel novo, nenhuma exceção de permissão.
- **Auditoria**: toda escrita (criação, edição, troca de imagem, ativação/desativação, atualização de configurações) grava `AuditLog` sem texto livre, seguindo a regra da Fatia 4.4.

## 9. Arquivos prováveis a serem criados ou alterados

**Schema:**
- `prisma/schema.prisma` (enum `AuditAction` ganha `ACTIVATE` — só após aprovação, seção 11.1)
- `prisma/migrations/<timestamp>_fatia4_fatia3_audit_activate/migration.sql`

**Repositório:**
- `src/lib/content/banner-repository.ts` (adicionar `listBannersForAdmin`)
- `src/lib/content/banner-repository.test.ts`
- `src/lib/content/social-links.ts` (novo — `parseSocialLinks`)
- `src/lib/content/social-links.test.ts` (novo)
- `src/lib/content/institutional-settings-repository.ts` (usar `parseSocialLinks` no `upsert`)
- `src/lib/content/institutional-settings-repository.test.ts`

**Rotas:**
- `src/app/api/admin/banners/route.ts` + `.test.ts`
- `src/app/api/admin/banners/[id]/route.ts` + `.test.ts`
- `src/app/api/admin/banners/[id]/image/route.ts` + `.test.ts`
- `src/app/api/admin/banners/[id]/activate/route.ts` + `.test.ts`
- `src/app/api/admin/banners/[id]/deactivate/route.ts` + `.test.ts`
- `src/app/api/admin/institutional-settings/route.ts` + `.test.ts`

**UI:**
- `src/app/admin/(dashboard)/banners/page.tsx`
- `src/app/admin/(dashboard)/banners/novo/page.tsx`
- `src/app/admin/(dashboard)/banners/[id]/page.tsx`
- `src/app/admin/(dashboard)/settings/page.tsx`
- Componentes de formulário/upload equivalentes a `ArticleTextForm`/`ArticleCoverUploadForm`, com nome próprio para banner (ex.: `BannerForm.tsx`, `BannerImageUploadForm.tsx`, `InstitutionalSettingsForm.tsx`)
- `src/components/admin/nav-items.ts` (adicionar `href` aos itens `banners` e `configuracoes`)

**Documentação (após implementação):**
- `docs/PLANO_MESTRE_FORTSULSC.md` (registro da fatia concluída, Parte VI)
- `docs/COMPONENTS.md` (novos componentes de painel)

## 10. Fluxo obrigatório de aprovação (não pular nenhuma etapa)

1. **Esta proposta** → aguarda aprovação explícita do Jose, incluindo as três decisões da seção 11.
2. **Revisão do Claude** sobre a proposta aprovada, antes de qualquer código.
3. **Implementação + testes smoke** pelo Codex.
4. **`scope-gate-reviewer`** antes de qualquer commit/push proposto (mudança estrutural: schema + rotas novas).
5. **`ui-reviewer`** sobre as quatro telas novas antes de considerar pronto para revisão do Claude.
6. **Lista de testes manuais** para o Jose (fluxo completo no navegador: criar banner com imagem → editar texto → trocar imagem → ativar → desativar; preencher configurações institucionais → recarregar e confirmar persistência; navegar pela sidebar até as duas telas novas).
7. **Aprovação dupla (Jose + Claude)** antes de qualquer commit — o Codex não commita, não faz merge, não faz push, mesmo na própria branch (`CLAUDE.md` §10).

## 11. Decisões que exigem aprovação explícita do Jose antes do Codex implementar

1. **Adicionar `ACTIVATE` ao enum `AuditAction`** (seção 5.1) — é alteração de schema; confirmar antes de gerar a migration.
2. **Confirmar que banner segue o mesmo princípio de "sem exclusão física" do artigo** (seção 5.3), só ativar/desativar.
3. **Confirmar a lista de redes sociais e o formato de validação de `socialLinks`** (seção 5.4) — Facebook/Instagram/LinkedIn/YouTube como proposto, ou outra lista.

Sem resposta a estes três pontos, o Codex deve implementar tudo o mais desta proposta e parar exatamente nesses três pontos, usando a suposição conservadora documentada em cada seção (5.1: adicionar `ACTIVATE`; 5.3: sem exclusão; 5.4: as quatro redes listadas) apenas se Jose autorizar seguir sem responder individualmente — caso contrário, aguardar resposta explícita antes de tocar nesses três itens específicos.

## 12. Recomendação final

Recomendo esta fatia como está descrita: reaproveita integralmente os padrões já validados em produção (guard, auditoria, storage, upload, layout de painel), adiciona uma única alteração de schema pequena e aditiva (`ACTIVATE`), e fecha a lacuna apontada na análise de dívidas técnicas anterior — hoje `Banner`/`InstitutionalSettings` têm dado e repositório prontos desde a Fatia 4.5, mas nenhuma forma de uso real. Não recomendo agrupar com Catálogo (Produtos/Categorias) nem com Parceiros/Revendas nesta mesma fatia, pelos motivos já registrados na proposta de priorização enviada ao Jose (domínios de complexidade e risco diferentes, inclusive dado privado no caso de Parceiros).
