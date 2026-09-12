# Componentes — FortSulSC

Status: documentação de componentes visuais
Última revisão: 2026-08-21

> **Governança:** consulte `PLANO_MESTRE_FORTSULSC.md` para o status vigente da fase de frontend antes de criar ou migrar qualquer componente listado abaixo.

## 1. Observação importante

O projeto ainda está em frontend estático. Portanto, os “componentes” abaixo representam blocos visuais existentes em HTML/CSS e o mapeamento esperado para futuros componentes React/Next.js.

Props são propostas de organização futura, não código implementado.

## 2. Padrões de nomenclatura

Quando o projeto migrar para React/Next.js:

- componentes em PascalCase;
- arquivos de componente em PascalCase quando representarem componente único;
- componentes de seção com sufixo `Section`;
- cards com sufixo `Card`;
- componentes de layout em `components/layout`;
- componentes reutilizáveis em `components/ui`;
- componentes específicos por domínio em `components/products`, `components/maps`, `components/admin`.

Exemplos:

- `SiteHeader`;
- `HeroSection`;
- `SolutionCard`;
- `SupportStep`;
- `RepresentativeMap`;
- `Footer`.

## 3. Componentes atuais e futuros

### 3.1 SiteHeader

- Nome atual: `site-header`, `utility-bar`, `nav-wrap`, `main-nav`.
- Objetivo: exibir topo, logo, navegação e CTA de orçamento.
- Quando utilizar: em todas as páginas públicas.
- Quando não utilizar: dentro do dashboard administrativo.
- Props futuras:
  - `navigationItems`;
  - `phone`;
  - `ctaLabel`;
  - `ctaHref`.
- Componentes relacionados:
  - `MobileMenu`;
  - `Button`.

Exemplo futuro:

```tsx
<SiteHeader
  phone="(48) 3660-0818"
  ctaLabel="Solicitar orçamento"
  ctaHref="#contato"
/>
```

### 3.2 HeroSection

- Nome atual: `hero`, `hero-media`, `hero-copy`, `hero-note`.
- Objetivo: abrir a página com promessa principal, imagem de impacto e CTA.
- Quando utilizar: home e landing pages principais.
- Quando não utilizar: páginas internas simples.
- Props futuras:
  - `eyebrow`;
  - `title`;
  - `description`;
  - `primaryCta`;
  - `secondaryCta`;
  - `backgroundImage`.
- Componentes relacionados:
  - `Button`;
  - `TextLink`.

### 3.3 CategoryStrip

- Nome atual: `category-strip`, `category-grid`.
- Objetivo: apresentar segmentos/categorias principais.
- Quando utilizar: home, páginas de catálogo ou landing pages.
- Quando não utilizar: quando houver muitas categorias; nesse caso preferir filtro/lista.
- Props futuras:
  - `items`;
  - `variant`.
- Componentes relacionados:
  - `ProductFilters`.

### 3.4 AboutSection

- Status: implementado no frontend Next.js.
- Nome atual: `about`, `about-fichario`, `AboutTabs`, `about-tablist`, `about-panel`.
- Objetivo: apresentar os conteúdos institucionais da FortSul em seis abas mutuamente exclusivas.
- Quando utilizar: home e página “Sobre”.
- Quando não utilizar: em páginas transacionais do admin.
- Acessibilidade: usa o padrão ARIA de tabs (`tablist`, `tab` e `tabpanel`), com uma aba ativa, foco móvel e navegação por `ArrowLeft`/`ArrowRight`/`Home`/`End`.
- Dados: o Server Component entrega o conteúdo estático de `about-tabs-data.ts` ao Client Component `AboutTabs`; não há CMS ou regra de negócio nesta etapa.
- Observação: as imagens do alimentador e do selo de qualidade não fazem mais parte da Home e ficam reservadas ao futuro cadastro do produto.

### 3.5 CategoryTabs / SolutionsGrid / ProductScroller

- Status: implementado (`src/components/solutions/CategoryTabs.tsx`, `SolutionsGrid.tsx`, `ProductScroller.tsx`).
- Objetivo: menu de categorias (`role="tablist"`, navegação por seta/Home/End) + carrossel horizontal com setas (mesmo padrão de `ContentCarousel`) dos produtos ativos da categoria selecionada.
- Quando utilizar: `SolutionsSection`, seção "Soluções" da Home.
- Props: `filters`/`activeFilter`/`solutions` prontos (tipos em `src/components/solutions/solutions-data.ts`), vindos de `listActiveCategoriesPublic()`/`listActiveProductsPublic()`.
- Observação: `ProductScroller` mantém o `activeItem` do popup (`ProductDialog`) e não decide regra de negócio — só repassa o item selecionado. Também sincroniza a URL com `?produto=<slug>` via `window.history.replaceState` (sem router do Next, para não forçar a Home a sair de geração estática) ao abrir/fechar o popup, e abre automaticamente o produto correspondente se a página carregar com esse parâmetro já na URL (link compartilhável).

### 3.6 SolutionCard

- Status: implementado (`src/components/solutions/SolutionCard.tsx`).
- Objetivo: card de produto — imagem de destaque, eyebrow opcional, nome; clique abre o popup do produto (`ProductDialog`).
- Quando utilizar: dentro de `ProductScroller`.
- Props: `solution` (dado pronto), `onSelect` (callback, sem lógica própria).
- Observação: o card inteiro é um `<button className="card-trigger">` (mesmo padrão de `.content-card-trigger`), não mais um link para a página estática legada `produto-alimentador.html` nem um gatilho do diálogo genérico de WhatsApp — essa página legada (Fase 1) fica órfã, fora do escopo desta fatia.

### 3.6.1 ProductDialog

- Status: implementado (`src/components/solutions/ProductDialog.tsx`).
- Objetivo: popup do produto — descrição, aplicações, especificações, galeria de fotos (rotação, mesmo padrão de `ContentArticleDialog`), depoimentos (ícone da rede social + link) e botão "Saiba mais" com link `wa.me` pré-preenchido, incluindo o link do próprio produto (`appendProductUrlToWhatsAppLink`, `src/lib/content/product-whatsapp.ts`) para o cliente acessar direto.
- Quando utilizar: só via `ProductScroller`.
- Props: `item` (`SolutionCardData | null`), `onClose`.
- Observação: mesmo padrão de acessibilidade de `ContentArticleDialog` — `<dialog>` nativo, foco preso, `Escape`, clique fora, foco inicial no botão fechar. `PlatformIcon` (local, sem lib nova) desenha o ícone de TikTok/Facebook/Instagram ao lado do link do depoimento.

### 3.7 SupportSection

- Nome atual: `support`, `support-heading`, `support-steps`.
- Objetivo: explicar a jornada de atendimento.
- Quando utilizar: home, páginas institucionais e páginas comerciais.
- Quando não utilizar: páginas de formulário curto ou admin.
- Props futuras:
  - `title`;
  - `description`;
  - `steps`.

### 3.8 SupportStep

- Nome atual: `support-steps article`, `step-icon`.
- Objetivo: representar uma etapa do atendimento.
- Quando utilizar: dentro de `SupportSection`.
- Quando não utilizar: isolado sem contexto.
- Props futuras:
  - `number`;
  - `title`;
  - `description`;
  - `icon`.

### 3.9 PresenceSection

- Nome atual: `presence`, `presence-grid`, `map-wrap`.
- Objetivo: comunicar presença regional e acesso a representantes.
- Quando utilizar: home e página de representantes.
- Quando não utilizar: quando a funcionalidade de mapa/lista ainda não estiver validada para uma página específica.
- Props futuras:
  - `title`;
  - `description`;
  - `mapImage`;
  - `cta`.
- Componentes relacionados:
  - `RepresentativeMap`;
  - `RepresentativeList`.

### 3.10 ContentSection

- Status: implementado, consumindo dados reais (`src/components/sections/ContentSection.tsx`).
- Nome atual: `content-section`, `content-heading`, `content-carousel`, `content-track`, `content-empty`.
- Objetivo: apresentar, na home pública, os artigos reais publicados no painel administrativo ("Novidades e dicas"), rolando automaticamente em um carrossel infinito.
- Quando utilizar: home.
- Quando não utilizar: páginas administrativas.
- Observação: `ContentSection` (Server Component assíncrono) busca `listPublishedArticlesPublic()` e repassa os dados já prontos para `ContentSectionView` (componente síncrono, testável, sem acesso a banco) — separação exigida por `CLAUDE.md` §8. Se não houver artigo publicado, mostra o texto "Em breve, novidades e dicas por aqui." em vez do carrossel. Se o banco estiver indisponível no momento da geração estática (build), cai para o mesmo estado vazio em vez de quebrar o build; `revalidatePath('/')`, chamado pelas rotas de publicar/despublicar artigo, regenera a página com dados reais assim que o banco responder.
- Componentes relacionados:
  - `ContentCarousel`;
  - `ContentCard`;
  - `ContentArticleDialog`;
  - `WhatsAppTrigger`.

### 3.11 ContentCard

- Status: implementado (`src/components/content/ContentCard.tsx`).
- Nome atual: `content-card`, `content-card-media`, `content-card-body`, `content-card-trigger`.
- Objetivo: apresentar capa, título e resumo de um artigo dentro do carrossel.
- Quando utilizar: dentro de `ContentCarousel`.
- Quando não utilizar: isolado sem a seção de conteúdo correspondente.
- Props: `item` (`ContentCardData`), `onSelect?` (torna o card um `<button>` que abre o popup do artigo), `decorative?` (usado só na cópia duplicada do carrossel para o loop contínuo — fica `aria-hidden` e não recebe `onSelect`, portanto não é focável nem lido por leitor de tela).

### 3.11.1 ContentCarousel

- Status: implementado (`src/components/content/ContentCarousel.tsx`, client component).
- Objetivo: renderizar a lista de `ContentCard` em rolagem automática infinita (CSS puro, `@keyframes content-scroll`) e controlar qual artigo está aberto no popup.
- Quando utilizar: dentro de `ContentSection`.
- Props: `items` (`ContentCardData[]`, já prontos).
- Observação: duplica os itens para o efeito de loop contínuo; a duplicata é `decorative` (ver 3.11). Pausa a rolagem em `:hover`/`:focus-within` e respeita `prefers-reduced-motion`.

### 3.11.2 ContentArticleDialog

- Status: implementado (`src/components/content/ContentArticleDialog.tsx`, client component).
- Objetivo: popup com o texto completo do artigo e a galeria de imagens adicionais, aberto ao clicar em um `ContentCard`.
- Quando utilizar: dentro de `ContentCarousel`.
- Props: `item` (`ContentCardData | null`), `onClose`.
- Observação: mesmo padrão de acessibilidade de `WhatsAppDialog` (`<dialog>` nativo, foco preso, ESC fecha, clique fora fecha). A galeria interna (`ArticleGalleryRotator`) roda automaticamente a cada 4s, mas para (a) se o usuário navegar manualmente pelas setas/bolinhas, e (b) se o sistema tiver `prefers-reduced-motion` ativado.

### 3.12 CtaSection

- Status: implementado no frontend Next.js.
- Nome atual: `cta-section`, `cta-inner`.
- Objetivo: fechar a página com chamada para contato/orçamento.
- Quando utilizar: final de páginas públicas comerciais.
- Quando não utilizar: em páginas administrativas.
- Props futuras:
  - `eyebrow`;
  - `title`;
  - `ctaLabel`;
  - `ctaHref`.

### 3.13 SiteFooter

- Nome atual: `site-footer`, `footer-grid`, `footer-bottom`.
- Objetivo: exibir dados institucionais, contato e redes sociais.
- Quando utilizar: todas as páginas públicas.
- Quando não utilizar: dashboard administrativo.
- Props futuras:
  - `address`;
  - `phone`;
  - `socialLinks`;
  - `legalLinks`.
- O símbolo "©" do copyright é um link real para `/admin/login`
  (`aria-label="Acesso administrativo"`), visualmente idêntico ao texto ao
  redor (sem sublinhado, sem mudança de cor em nenhum estado de mouse) —
  atalho discreto para o painel administrativo, aprovado por Jose.

### 3.14 FloatingWhatsApp

- Nome atual: `whatsapp-float`.
- Objetivo: manter acesso rápido ao WhatsApp.
- Quando utilizar: páginas públicas com objetivo comercial.
- Quando não utilizar: admin, login e fluxos em que o CTA fixo atrapalhe usabilidade.
- Props futuras:
  - `phone`;
  - `message`;
  - `ariaLabel`.

### 3.15 WhatsAppDialog

- Status: implementado no frontend estático.
- Objetivo: apresentar o telefone institucional e concentrar o link externo para iniciar uma conversa no WhatsApp.
- Quando utilizar: CTAs comerciais e botão flutuante das páginas públicas.
- Quando não utilizar: admin, login ou páginas em que contato comercial não seja relevante.
- Comportamento de acessibilidade: usa `role="dialog"`, `aria-modal="true"`, título associado por `aria-labelledby`, foco preso enquanto aberto, retorno do foco ao CTA de origem e fechamento por botão, clique no overlay ou tecla `Esc`.
- Props futuras:
  - `phone`;
  - `whatsappUrl`;
  - `title`;
  - `description`.

### 3.16 RepresentativeMapPanel / LeafletMap (RepresentativeMap)

- Status: implementado (`src/components/representatives/RepresentativeMapPanel.tsx`, `LeafletMap.tsx`). Substitui a especificação original de página dedicada mapa-à-esquerda/dados-à-direita (Parte II, 30/08/2026) por um painel deslizante sobre a Home — decisão confirmada por Jose em 12/09/2026 (Plano Mestre) junto com a aprovação dos pontos 1-4 desta fatia.
- Objetivo: painel modal (`role="dialog"`, foco preso, ESC fecha, `body.dialog-open` trava o scroll — mesmo padrão obrigatório de `WhatsAppDialog`/`ContentArticleDialog`, ver `DESIGN-SYSTEM.md` §13) que desliza da direita cobrindo a tela: metade mapa interativo Leaflet/OpenStreetMap (`LeafletMap`, dynamic import `ssr:false`), metade busca por cidade/nome + lista de resultados + card do representante selecionado (nome, tipo, descrição, municípios atendidos, link `wa.me` próprio do parceiro).
- Quando utilizar: acionado pelos dois pontos de entrada da `PresenceSection` — botão "Encontrar representante" e clique na imagem estática do mapa (`.map-trigger`).
- Quando não utilizar: fora do contexto de busca de representante/revenda na Home.
- Dados: consome `GET /api/public/partners` (primeira rota pública dinâmica do projeto), que expõe só os campos aprovados por Jose em 12/09/2026 — nome, tipo, WhatsApp, site, redes sociais, descrição, coordenada aproximada, logo, municípios atendidos — nunca dados de `PartnerPrivate`. Rate limiting básico por IP (`RateLimitContext.PARTNERS_READ`, 30 req/min, reaproveitando `src/lib/auth/rate-limit.ts`).
- Geolocalização: `navigator.geolocation` captura a posição do visitante ao abrir (marcador azul "Minha localização"); negada/indisponível cai para a visão padrão da Região Sul, nunca bloqueia o uso do painel. Requer `Permissions-Policy: geolocation=(self)` e `img-src` liberando `https://*.tile.openstreetmap.org` (`src/lib/security/headers.ts`) — sem isso o navegador bloqueia a API e os ladrilhos do mapa nunca carregam (achado desta sessão, verificado e corrigido antes da entrega).
- Props: `RepresentativeMapPanel({ open, onClose })`; `LeafletMap({ partners, userPosition, selectedPartnerId, onSelectPartner })`.
- Observação de segurança: coordenadas de representante pessoa física já chegam arredondadas do servidor (`roundApproximateCoordinate`, ver 3.40); a posição do visitante nunca é enviada ao servidor nem logada, fica só no cliente.

### 3.17 AdminShell

- Status: implementado (`src/components/admin/AdminShell.tsx`, `AdminSidebar.tsx`).
- Objetivo: estrutura visual do painel administrativo (sidebar + área de conteúdo).
- Quando utilizar: rotas protegidas `/admin` (real, autenticada) e a prévia visual `/admin/preview-dashboard`.
- Quando não utilizar: site público.
- Props: `children`.
- Observação: `AdminSidebar` navega de verdade (via `next/link` + `usePathname`) só nos itens de `NAV_ITEMS` que já têm página própria (hoje: Dashboard, Produtos, Categorias, Novidades e dicas, Banners, Configurações); os demais domínios (Representantes, Revendas, Regiões, Documentação) continuam como botões inertes de seleção local até terem rota real. A classe `admin-panel` na raiz do shell corrige o tamanho de `h1`/`h2` herdado do CSS institucional do site público (ver `src/app/admin/admin-tailwind.css`).

### 3.18 ArticleTextForm

- Status: implementado (`src/components/admin/ArticleTextForm.tsx`).
- Objetivo: formulário de título/resumo/corpo de um artigo de "Novidades e dicas", usado tanto na criação quanto na edição.
- Quando utilizar: telas `/admin/articles/novo` e `/admin/articles/[id]`.
- Quando não utilizar: site público.
- Props: `articleId?`, `initialTitle?`, `initialExcerpt?`, `initialBody?`.
- Observação: componente só coleta entrada e chama a API (`POST`/`PATCH /api/admin/articles[/[id]]`); a geração de slug e a persistência ficam no servidor.

### 3.19 ArticleCoverUploadForm

- Status: implementado (`src/components/admin/ArticleCoverUploadForm.tsx`).
- Objetivo: upload da imagem de capa obrigatória para publicar um artigo (JPEG/PNG/WEBP, até 5 MB).
- Quando utilizar: tela `/admin/articles/[id]`.
- Quando não utilizar: criação de artigo (a capa só pode ser enviada depois que o artigo existe).
- Props: `articleId`, `currentUrl?`, `currentAlt?`.
- Observação: tamanho ideal recomendado na própria tela (1200×675px, 16:9), alinhado ao box fixo do card público (`.content-card-media`, 230px de altura, `object-fit: cover`).

### 3.20 ArticlePublishToggle

- Status: implementado (`src/components/admin/ArticlePublishToggle.tsx`).
- Objetivo: alternar um artigo entre rascunho e publicado por meio de uma única caixa de seleção (sem exclusão de artigo — decisão de Jose; artigos são reutilizáveis via publicar/despublicar).
- Quando utilizar: tela `/admin/articles/[id]`.
- Props: `articleId`, `initialPublished`.
- Observação: a regra "precisa de capa e texto alternativo para publicar" é validada só no servidor; o componente apenas exibe a mensagem de erro devolvida pela API.

### 3.21 ArticleGallery

- Status: implementado (`src/components/admin/ArticleGallery.tsx`).
- Objetivo: galeria de até 4 imagens adicionais por artigo (além da capa), exibidas ao final do artigo publicado.
- Quando utilizar: tela `/admin/articles/[id]`.
- Props: `articleId`, `images` (lista pronta, vinda do servidor), `maxImages`.
- Observação: exclusão de uma imagem individual da galeria é sempre permitida, mesmo com o artigo publicado — não se confunde com a regra "sem exclusão" de artigo, que é sobre o ciclo de vida do artigo inteiro. Página pública consumidora da galeria ainda não existe.

### 3.22 BannerForm

- Status: implementado (`src/components/admin/BannerForm.tsx`).
- Objetivo: formulário de título/texto alternativo/link/janela de agendamento de um banner, usado tanto na criação (com upload de imagem obrigatório, em uma única etapa) quanto na edição (só texto).
- Quando utilizar: telas `/admin/banners/novo` e `/admin/banners/[id]`.
- Props: `bannerId?`, `initial?` (título, texto alternativo, link, datas).
- Observação: diferente de `Article`, `Banner` nunca existe sem imagem no schema — por isso a criação é um único `POST` multipart (texto + arquivo), sem fluxo em duas etapas. Componente só coleta entrada e chama a API (`POST`/`PATCH /api/admin/banners[/[id]]`); validação de data/link fica no servidor.

### 3.23 BannerImageForm

- Status: implementado (`src/components/admin/BannerImageForm.tsx`).
- Objetivo: substituir a imagem de um banner já existente (JPEG/PNG/WEBP, até 5 MB).
- Quando utilizar: tela `/admin/banners/[id]`.
- Quando não utilizar: criação de banner (a imagem já nasce junto, via `BannerForm`).
- Props: `bannerId`, `imageUrl`, `altText`.
- Observação: mesmo padrão de `ArticleCoverUploadForm` — a imagem antiga só é excluída do storage depois que o banco confirma a nova.

### 3.24 BannerActiveToggle

- Status: implementado (`src/components/admin/BannerActiveToggle.tsx`).
- Objetivo: alternar um banner entre ativo e inativo por meio de uma única caixa de seleção (sem exclusão física — mesmo princípio já aprovado para `Article`).
- Quando utilizar: tela `/admin/banners/[id]`.
- Props: `bannerId`, `initialActive`.
- Observação: `active` é um kill switch absoluto sobre a janela de datas — um banner fora do período `startAt`/`endAt` nunca aparece publicamente, mas um banner dentro do período também não aparece se `active: false`. Mais de um banner pode ficar ativo ao mesmo tempo (sem limite artificial). Exibição pública de banners na Home ainda não existe (fora do escopo desta fatia).

### 3.25 InstitutionalSettingsForm

- Status: implementado (`src/components/admin/InstitutionalSettingsForm.tsx`).
- Objetivo: formulário único de contato institucional (WhatsApp, telefone, e-mail, CNPJ, endereço) e redes sociais (Facebook/Instagram/LinkedIn/YouTube).
- Quando utilizar: tela `/admin/settings`.
- Props: `initial?` (linha única de configurações, ou `undefined` na primeira vez).
- Observação: sem lista nem "novo" — é sempre a mesma linha (`singletonKey = 1`). Links de rede social são sempre `https://` ou ausentes; a validação de formato (`parseSocialLinks`, `src/lib/content/social-links.ts`) roda no servidor, o componente só filtra campos vazios antes de enviar.

### 3.26 BannerStrip

- Status: implementado (`src/components/sections/BannerStrip.tsx`).
- Objetivo: buscar os banners ativos (`findActiveBannersPublic()`) e repassar prontos para `BannerStripView`. Server Component assíncrono, mesmo padrão de `ContentSection`.
- Quando utilizar: `src/app/page.tsx`, entre `HeroSection` e `CategoryStrip`.
- Observação: busca envolvida em `try/catch` — se o banco estiver indisponível na geração estática, a faixa simplesmente não aparece (nunca quebra o build). `revalidatePath('/')` é chamado pelas rotas `activate`/`deactivate`/troca de imagem de banner, então a Home atualiza assim que um banner muda de estado.

### 3.27 BannerStripView

- Status: implementado (`src/components/sections/BannerStripView.tsx`).
- Objetivo: exibir a faixa promocional de banners ativos abaixo do Hero — imagem em largura total (proporção 4:1 recomendada), clicável quando o banner tem `linkUrl` (abre em nova aba).
- Quando utilizar: só via `BannerStrip`; não chama Prisma diretamente.
- Props: `items` (lista pronta: `id`, `imageUrl`, `altText`, `linkUrl`).
- Observação: sem banner ativo, não renderiza nada (sem espaço vazio nem título). Com 2+ banners, mostra setas de navegação (scroll nativo + `scrollBy`, mesmo padrão de `ContentCarousel`/`.solution-carousel`) — sem rotação automática, decisão já validada nas fatias anteriores por causar cortes visuais em testes reais de celular. Setas ocultas em telas pequenas (relia em `scroll-snap` + gesto de deslizar).

### 3.28 CategoryForm

- Status: implementado (`src/components/admin/CategoryForm.tsx`).
- Objetivo: formulário de nome/slug/ordem de uma categoria, usado na criação e na edição.
- Quando utilizar: telas `/admin/categories/novo` e `/admin/categories/[id]`.
- Props: `categoryId?`, `initial?` (nome, slug, ordem).

### 3.29 CategoryActiveToggle

- Status: implementado (`src/components/admin/CategoryActiveToggle.tsx`).
- Objetivo: alternar uma categoria entre ativa e inativa (mesmo padrão de `BannerActiveToggle`). Categoria inativa esconde, na consulta pública, os produtos que só têm essa categoria.
- Quando utilizar: tela `/admin/categories/[id]`.
- Props: `categoryId`, `initialActive`.

### 3.30 CategoryDeleteButton

- Status: implementado (`src/components/admin/CategoryDeleteButton.tsx`).
- Objetivo: excluir fisicamente uma categoria, com confirmação (`window.confirm`). O servidor bloqueia a exclusão (409, mensagem clara) enquanto houver produto vinculado — restrição já garantida pelo banco (`onDelete: Restrict`), não recalculada no componente.
- Quando utilizar: tela `/admin/categories/[id]`.
- Props: `categoryId`.

### 3.31 ProductForm

- Status: implementado (`src/components/admin/ProductForm.tsx`).
- Objetivo: formulário de texto do produto (código, nome, eyebrow, descrições, link de catálogo, mensagem de WhatsApp customizada), usado na criação e na edição.
- Quando utilizar: telas `/admin/products/novo` e `/admin/products/[id]`.
- Props: `productId?`, `initial?`.
- Observação: `code` é inserido manualmente pelo admin (não derivado do nome), único no banco. `whatsappMessageTemplate` aceita `{produto}` como placeholder, substituído pelo nome do produto (`buildProductWhatsAppLink`, `src/lib/content/product-whatsapp.ts`); vazio usa uma mensagem padrão.

### 3.32 ProductActiveToggle / ProductDeleteButton

- Status: implementado (`src/components/admin/ProductActiveToggle.tsx`, `ProductDeleteButton.tsx`).
- Objetivo: ativar/desativar (mesmo padrão de `BannerActiveToggle`) e excluir fisicamente um produto (com confirmação) — diferente do padrão "sem exclusão" de `Article`/`Banner`, decisão explícita de Jose para esta fatia. A exclusão remove em cascata (já garantido pelo schema) categorias vinculadas, aplicações, especificações, imagens e depoimentos, e limpa as imagens do storage.
- Quando utilizar: tela `/admin/products/[id]`.

### 3.33 ProductCategoriesForm

- Status: implementado (`src/components/admin/ProductCategoriesForm.tsx`).
- Objetivo: selecionar (checkbox) as categorias vinculadas ao produto, substituindo a lista inteira de uma vez (`PUT /api/admin/products/[id]/categories`).
- Quando utilizar: tela `/admin/products/[id]`.
- Props: `productId`, `categories` (lista pronta com `active`, para indicar categoria inativa), `initialSelectedIds`.

### 3.34 ProductImagesForm

- Status: implementado (`src/components/admin/ProductImagesForm.tsx`).
- Objetivo: upload de imagens do produto (JPEG/PNG/WEBP, até 5 MB), com papel "Principal" (`HERO`) ou "Galeria" (`GALLERY`) — mesmo padrão de `ArticleGallery`. Exibe a dimensão recomendada e o limite de imagens (`PRODUCT_IMAGE_RECOMMENDED_WIDTH_PX`/`HEIGHT_PX`, `MAX_PRODUCT_IMAGES` — 1600×900px 16:9, até 6 imagens — em `src/lib/content/product-image-input.ts`) e esconde o formulário de upload ao atingir o limite, mesmo padrão de `ArticleGallery`/`ProductTestimonialsForm`.
- Quando utilizar: tela `/admin/products/[id]`.
- Props: `productId`, `images`.

### 3.35 ProductApplicationsForm / ProductSpecificationsForm

- Status: implementado (`src/components/admin/ProductApplicationsForm.tsx`, `ProductSpecificationsForm.tsx`).
- Objetivo: editores de lista dinâmica (adicionar/remover linhas) para as aplicações (só rótulo) e especificações (rótulo + valor) do produto, salvos como substituição da lista inteira (`PUT`). `ProductSpecificationsForm` tem atalhos de um clique para Altura/Largura/Comprimento/Peso (preenchem o rótulo e sugerem a unidade no placeholder do valor), evitando digitar o rótulo à mão.
- Quando utilizar: tela `/admin/products/[id]`.
- Props: `productId`, `initialLabels`/`initialRows`.

### 3.36 ProductTestimonialsForm

- Status: implementado (`src/components/admin/ProductTestimonialsForm.tsx`).
- Objetivo: depoimentos de parceiros/influenciadores — rede social (TikTok/Facebook/Instagram), link da publicação, nome do autor opcional. Limite de 3 por produto (reforçado no cliente só para UX; a validação de verdade é no servidor, `MAX_PRODUCT_TESTIMONIALS` em `src/lib/content/testimonial-input.ts`).
- Quando utilizar: tela `/admin/products/[id]`.
- Props: `productId`, `testimonials`.

### 3.37 CharCounter / CountedField

- Status: implementado (`src/components/admin/CharCounter.tsx`, `src/components/admin/CountedField.tsx`).
- Objetivo: padronizar o contador de caracteres ("N/máximo caracteres", destacado em vermelho ao atingir o limite) em todo formulário administrativo com campo de texto limitado. `CharCounter` é a exibição pura (`length`, `max`); `CountedField` embrulha um `<input>`/`<textarea>` com seu próprio estado de contagem, para formulários que só precisam soltar o campo pronto sem gerenciar `useState` por campo (ver `PartnerForm`).
- Quando utilizar: qualquer campo de texto com limite definido em `src/lib/content/text-limits.ts`. `CharCounter` quando o formulário já gerencia o valor do campo (ex.: `ArticleTextForm`, campos controlados); `CountedField` quando o formulário usa campos não controlados (`defaultValue`/`FormData`, ex.: `PartnerForm`, `CommercialAreaForm`).
- Props de `CharCounter`: `length`, `max`. Props de `CountedField`: `name`, `label`, `maxLength`, `defaultValue?`, `required?`, `type?` (`'text' | 'tel' | 'url' | 'textarea'`), `rows?`.

### 3.38 CommercialAreaForm / CommercialAreaDeleteButton

- Status: implementado (`src/components/admin/CommercialAreaForm.tsx`, `CommercialAreaDeleteButton.tsx`).
- Objetivo: CRUD de área comercial (agrupamento de negócio de municípios, usado para cobertura de parceiros — não confundir com a hierarquia geográfica oficial do IBGE, que não tem tela própria). Exclusão física, bloqueada pelo banco (`P2003`) enquanto houver parceiro vinculado.
- Quando utilizar: telas `/admin/commercial-areas`, `/novo`, `/[id]`.
- Props: `CommercialAreaForm({ commercialAreaId?, initial? })`; `CommercialAreaDeleteButton({ commercialAreaId })`.

### 3.39 CommercialAreaMunicipalitiesForm

- Status: implementado (`src/components/admin/CommercialAreaMunicipalitiesForm.tsx`).
- Objetivo: busca-e-adiciona de municípios (Região Sul, ~1.191 no total) via combobox acessível (`role="combobox"`/`listbox`/`option`, navegação por setas/Enter/Escape) — digitar filtra por nome, selecionar adiciona um chip removível à lista. Substituiu a versão anterior (grade de checkboxes com `hidden` para filtrar) a pedido do Jose ("os valores confusos" era, na prática, dado de teste vazado em produção — ver Plano Mestre 12/09/2026 — mas a oportunidade foi usada para simplificar a UI); a seleção agora é estado controlado (array de IDs), o que elimina de raiz a classe de bug já corrigida antes (perda de marcação ao filtrar com item desmontado do DOM).
- Quando utilizar: tela `/admin/commercial-areas/[id]`.
- Props: `commercialAreaId`, `states` (via `listStatesWithMunicipalities()`, somente leitura), `initialSelectedIds`.

### 3.40 PartnerForm

- Status: implementado (`src/components/admin/PartnerForm.tsx`).
- Objetivo: formulário único de parceiro (representante/revenda) combinando dados públicos (tipo, nome, descrição, WhatsApp, site, coordenadas aproximadas — com campo opcional de link de localização do Google/Apple Maps, que sempre vence lat/lng digitados manualmente — e redes sociais) e dados privados LGPD (duas caixas de seleção com frase fixa: documento físico assinado e autorização de divulgação de dados, ver `src/lib/content/partner-private-input.ts`) — decisão explícita do Jose de manter os dois no mesmo formulário, com a seção privada destacada visualmente (fundo âmbar). Coordenadas são sempre arredondadas no servidor (`src/lib/content/partner-input.ts`), nunca no cliente; a extração de coordenadas do link também é só servidor (`src/lib/content/location-link.ts`, allowlist de host, segue redirect de link curto uma única vez). Usa `CountedField` para todo campo com limite de caracteres.
- Quando utilizar: telas `/admin/partners/novo`, `/admin/partners/[id]`.
- Props: `partnerId?`, `initial?`, `defaultType?` (`'REPRESENTATIVE' | 'RESELLER'`, usado só na criação).

### 3.41 PartnerActiveToggle / PartnerDeleteButton

- Status: implementado (`src/components/admin/PartnerActiveToggle.tsx`, `PartnerDeleteButton.tsx`).
- Objetivo: mesmo padrão de `ProductActiveToggle`/`ProductDeleteButton`. Exclusão física, restrita à role `ADMIN` no servidor (achado da auditoria de segurança de 11/09/2026).
- Quando utilizar: tela `/admin/partners/[id]`.
- Props: `partnerId`, `initialActive` (só no toggle).

### 3.42 PartnerCommercialAreasForm / PartnerLogoForm

- Status: implementado (`src/components/admin/PartnerCommercialAreasForm.tsx`, `PartnerLogoForm.tsx`).
- Objetivo: `PartnerCommercialAreasForm` é o checklist de áreas comerciais vinculadas (mesmo padrão de `ProductCategoriesForm`). `PartnerLogoForm` é o upload de logo (mesmo padrão de `ProductImagesForm`, com `image-signature.ts` validando os bytes reais do arquivo); o texto alternativo da imagem é derivado do nome do parceiro (`Logo de ${partnerName}`), não digitado pelo admin.
- Quando utilizar: tela `/admin/partners/[id]`.
- Props: `PartnerCommercialAreasForm({ partnerId, commercialAreas, initialSelectedIds })`; `PartnerLogoForm({ partnerId, partnerName, logoUrl })`.

### 3.43 PartnersTable / PartnerTypeTabs

- Status: implementado (`src/components/admin/PartnersTable.tsx`, `PartnerTypeTabs.tsx`).
- Objetivo: `PartnersTable` é a tabela de listagem (mesmo padrão visual de `products`/`categories`). `PartnerTypeTabs` são links de navegação entre `/admin/partners/representantes` e `/admin/partners/revendas` (páginas distintas, não troca de conteúdo na mesma tela) — por isso usa `aria-current="page"` como `AdminSidebar`, não `role="tablist"`/`role="tab"` (esse padrão é reservado a abas que trocam conteúdo na mesma página, ver `AboutTabs`/`CategoryTabs`).
- Quando utilizar: telas `/admin/partners/representantes`, `/admin/partners/revendas`.
- Props: `PartnersTable({ partners, emptyLabel })`; `PartnerTypeTabs({ activeHref })`.

## 4. Regra para novos componentes

Antes de criar componente novo:

1. verificar se um componente existente resolve;
2. confirmar se a necessidade está no escopo aprovado;
3. evitar regra de negócio dentro do componente visual;
4. garantir responsividade;
5. garantir texto alternativo em imagens;
6. documentar aqui se o componente for reutilizável.
