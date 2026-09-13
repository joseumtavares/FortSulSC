# Web Interface Guidelines — Achados (12/09/2026)

Skill instalada: `.claude/skills/web-design-guidelines/` (origem: `vercel-labs/agent-skills`).
Guia usado: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

Auditoria somente leitura — nenhum arquivo foi alterado. 99 arquivos `.tsx` revisados
(`src/app/**`, `src/components/admin/**`, demais `src/components/**`), divididos em 3
agentes paralelos.

---

## Padrões recorrentes (afetam vários arquivos)

### 1. Mensagem de erro genérica sem próximo passo (~25 ocorrências)
Quando a API retorna erro sem `data.error`, o fallback só repete o problema
("Não foi possível salvar o artigo.") sem dizer o que fazer. O fallback de falha de
rede já está correto ("Falha de conexão. Tente novamente."). Afeta quase todo
formulário do admin: `ArticleCoverUploadForm`, `ArticleGallery`, `ArticleTextForm`,
`BannerActiveToggle`, `BannerForm`, `BannerImageForm`, `CategoryActiveToggle`,
`CategoryDeleteButton`, `CategoryForm`, `CommercialAreaDeleteButton`,
`CommercialAreaForm`, `CommercialAreaMunicipalitiesForm`, `InstitutionalSettingsForm`,
`PartnerActiveToggle`, `PartnerCommercialAreasForm`, `PartnerDeleteButton`,
`PartnerForm`, `PartnerLogoForm`, `ProductActiveToggle`, `ProductApplicationsForm`,
`ProductCategoriesForm`, `ProductDeleteButton`, `ProductForm`, `ProductImagesForm`,
`ProductSpecificationsForm`, `ProductTestimonialsForm`.
Correção provável: uma mensagem padrão única ("Tente novamente em instantes.") num
helper compartilhado, em vez de reescrever em cada componente.

### 2. Imagem sem `width`/`height` explícito (~12 ocorrências, risco de CLS)
`ArticleCoverUploadForm`, `ArticleGallery`, `BannerImageForm`, `PartnerLogoForm`,
`ProductImagesForm` (previews de upload no admin); `ContentArticleDialog`,
`ContentCard`, `BannerStripView`, `ProductDialog`, `SolutionCard`,
`RepresentativeMapPanel` (site público); `banners/page.tsx` (admin).

### 3. Falta `&nbsp;` entre número e unidade ("até 5 MB")
`ArticleCoverUploadForm`, `ArticleGallery`, `BannerForm`, `BannerImageForm`,
`PartnerLogoForm`, `ProductImagesForm`.

### 4. Estado de filtro/aba só em `useState`, não na URL (não é compartilhável/voltável)
`AboutTabs.tsx:20`, `SolutionsGrid.tsx:9`, `PartnersTable.tsx:20` (admin).

### 5. Sem aviso de alterações não salvas ao navegar
Formulários de várias seções sem `beforeunload`/guarda de rota: `ArticleTextForm`,
`BannerForm`, `CategoryForm`, `CommercialAreaForm`, `InstitutionalSettingsForm`,
`PartnerForm` (inclui dados privados/LGPD), `ProductForm`.

### 6. Texto de usuário sem `truncate`/`line-clamp`/`break-words`
Nomes/títulos em tabelas do admin: `articles/page.tsx:56`, `banners/page.tsx:24`,
`categories/page.tsx:23`, `commercial-areas/page.tsx:23`, `products/page.tsx:24`.

---

## Achados pontuais

- `src/app/admin/(dashboard)/articles/page.tsx:39-41,54` — células de cabeçalho sem
  `scope="col"`, coluna principal é `<td>` em vez de `<th scope="row">` (diferente
  das outras tabelas do admin).
- `src/components/admin/AdminSidebar.tsx:85` — `transition-[width]` anima layout, não
  é compatível com compositor (usar `transform`/`opacity`).
- `src/components/sections/HeroSection.tsx:13` — `preload` não é prop válida do
  `next/image`; a imagem do hero (acima da dobra) não está com `priority` de fato.
- `src/components/representatives/RepresentativeMapPanel.tsx` — texto de status de
  geolocalização e mensagens de erro mudam dinamicamente sem `aria-live="polite"`.
- `src/components/admin/CharCounter.tsx:5` — dígitos do contador sem
  `font-variant-numeric: tabular-nums` (largura "pula" ao digitar).
- `src/components/admin/ProductForm.tsx:39` — aspas retas `"Saiba mais"` deveriam ser
  curvas `"Saiba mais"`.
- `src/components/admin/CodeStepForm.tsx:58`, `PasswordStepForm.tsx:84` — `'Verificando...'`/`'Entrando...'` usam três pontos literais em vez de `…`.
- `src/components/admin/CodeStepForm.tsx:36`, `PasswordStepForm.tsx:44` — campos de
  código/e-mail sem `spellCheck={false}`.
- `src/components/admin/CommercialAreaMunicipalitiesForm.tsx:113`,
  `PartnerForm.tsx:165` — placeholder é uma instrução, não um exemplo terminado em `…`.

---

## Sem achados

Todas as páginas públicas (`layout.tsx`, `page.tsx`, `not-found.tsx`), todas as
páginas administrativas de edição/criação (`[id]/page.tsx`, `novo/page.tsx`,
`settings/page.tsx`), e a maioria dos componentes de layout, WhatsApp e UI
passaram sem achado.

---

## Observação geral

O achado nº 1 (mensagem de erro sem próximo passo) e o nº 2 (imagem sem dimensão)
são de baixo risco real e alto volume — ambos resolvíveis com uma correção
centralizada (um helper de mensagem padrão; e um passe trocando `<img>` por
`next/image` ou adicionando `width`/`height` nos previews de upload) em vez de
editar arquivo por arquivo.
