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

### 3.5 SolutionFilters

- Nome atual: `solution-filters`, `filter-button`.
- Objetivo: permitir filtro visual de soluções na página.
- Quando utilizar: listas pequenas de soluções/produtos.
- Quando não utilizar: filtros com busca, paginação ou dados remotos sem backend aprovado.
- Props futuras:
  - `filters`;
  - `activeFilter`;
  - `onFilterChange`.
- Observação: hoje é interação de frontend estático.

### 3.6 SolutionCard

- Nome atual: `solution-card`, `card-media`, `card-body`, `card-tag`.
- Objetivo: destacar produto, solução ou categoria.
- Quando utilizar: grids de produtos/soluções.
- Quando não utilizar: listas administrativas densas.
- Props futuras:
  - `title`;
  - `category`;
  - `image`;
  - `href`;
  - `featured`;
  - `tag`.
- Componentes relacionados:
  - `Button`;
  - `ProductCard`.

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

- Nome atual: `content-section`, `content-heading`, `content-grid`.
- Objetivo: apresentar novidades e dicas estáticas da FortSul.
- Quando utilizar: home e páginas institucionais com conteúdo editorial estático aprovado.
- Quando não utilizar: antes de existir conteúdo aprovado ou para CMS/artigos dinâmicos sem a Fase 3 autorizada.
- Observação: os três cards atuais são conteúdo de teste aprovado exclusivamente para validação de layout e devem ser substituídos antes do lançamento.
- Componentes relacionados:
  - `ContentCard`;
  - `WhatsAppTrigger`.

### 3.11 ContentCard

- Nome atual: `content-card`, `content-card-media`, `content-card-body`.
- Objetivo: apresentar imagem, título e descrição de uma novidade ou dica.
- Quando utilizar: dentro de `ContentSection`.
- Quando não utilizar: isolado sem a seção de conteúdo correspondente.
- Props futuras:
  - `image`;
  - `title`;
  - `description`.

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

### 3.16 RepresentativeMap

- Status: planejado, não implementado.
- Objetivo: exibir representantes/revendas em mapa interativo.
- Quando utilizar: página de representantes e revendas.
- Quando não utilizar: antes de aprovar dados públicos, privacidade e regras de localização.
- Tecnologia prevista: Leaflet + OpenStreetMap, na Fase 5 do Plano Mestre.
- Fluxo previsto: marcadores interativos com popup de dados públicos aprovados e, quando disponível, logotipo público do representante ou da revenda. Dados e logotipos de teste não podem ser promovidos a conteúdo público sem aprovação específica.
- Regra temporária de CTA: até a página e o mapa interativo serem implementados e aprovados, o botão "Encontrar representante" da `PresenceSection` continua abrindo o diálogo do WhatsApp.
- Props futuras:
  - `markers`;
  - `initialState`;
  - `filters`;
  - `onMarkerClick`.
- Observação de segurança: representantes e revendas permanecem entidades distintas; representantes pessoa física devem usar localização pública aproximada.

### 3.17 AdminShell

- Status: planejado, não implementado.
- Objetivo: estrutura visual do painel administrativo.
- Quando utilizar: rotas protegidas `/admin`.
- Quando não utilizar: site público.
- Props futuras:
  - `user`;
  - `navigation`;
  - `children`.
- Observação: depende de aprovação para autenticação, RBAC e backend.

## 4. Regra para novos componentes

Antes de criar componente novo:

1. verificar se um componente existente resolve;
2. confirmar se a necessidade está no escopo aprovado;
3. evitar regra de negócio dentro do componente visual;
4. garantir responsividade;
5. garantir texto alternativo em imagens;
6. documentar aqui se o componente for reutilizável.
