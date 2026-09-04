# Proposta técnica — Tarefa 3, Fatia 4 (Incremento 5 — Soluções e filtros)

Status: APROVADA — AGUARDANDO IMPLEMENTAÇÃO (executor designado: Codex; nenhum código foi criado ou alterado por esta proposta)
Data: 29/08/2026 (revisão 2 — aprovada)
Executor designado: Codex

Skills aplicáveis declarados: `using-agent-skills` (fluxo), `incremental-implementation`/vertical slicing (Fatia 4 dentro da Tarefa 3), `test-driven-development` (contrato de testes descrito nesta proposta; código de teste só é escrito na implementação — Fase 2 ainda não exige testes versionados como pré-condição de proposta), `frontend-design`/design-system adherence.

---

## 0. Estado do repositório e fontes consultadas

- Branch `main`, HEAD em `64073e1` (Tarefa 3.3 — Fatia 3, Hero/CategoryStrip/AboutSection). Working tree limpo além de arquivos de tooling já presentes antes desta tarefa (`.agents/`, `.mcp.json`, `skills-lock.json`, `docs/CODEBASE_MAP.md`).
- `next: ^16.2.9` (`package.json`) — mesma versão usada e verificada na Fatia 3; API de `next/image` (`fill`, `sizes`, `preload`, exigência de `width`/`height` fora de `fill`) reaproveitada sem nova consulta ao Context7, pois nenhuma prop nova é introduzida nesta fatia.
- Documentos lidos: `docs/PLANO_MESTRE_FORTSULSC.md`, `docs/PLANEJAMENTO_PROJETO.md` (seções 3.1, 4.3, resolução de conflitos de categorias, tabela §23), `docs/COMPONENTS.md` (§3.5 SolutionFilters, §3.6 SolutionCard), `docs/RULES.md`, `tasks/plan.md`, `tasks/todo.md`, `docs/Proposta_Tarefa_3_Fatia_3.md` (precedente de formato e de decisões D1–D4).
- Baseline lido integralmente: `index.html` (seção `#solucoes`, linhas 146–208), `styles.css` (regras `.solutions*`, `.section-heading*`, `.filter-button*`, `.solution-card*`, `.card-media*`, `.split-media*`, `.card-body*`, `.filter-empty`, breakpoints 1050/820/560px), `script.js` (lógica de filtro linhas 53–75).
- Estado atual do código React: `src/components/sections/` (HeroSection, CategoryStrip, AboutSection), `src/components/ui/Reveal.tsx`, `src/components/whatsapp/` (WhatsAppProvider, WhatsAppTrigger, WhatsAppDialog — já integrados via `SiteHeader`/`SiteFooter`), `src/app/page.tsx` atual: `<HeroSection /><CategoryStrip /><AboutSection />`.
- Dimensões reais dos assets de imagem desta seção verificadas em `public/image/` por dois métodos independentes (parser manual de cabeçalho WebP em Python + `file`/libmagic), que concordaram exatamente — ver §0.2.

## 0.1 Mapeamento desta fatia para a nomenclatura do planejamento

Jose usa "Fatia 4" (quarto bloco da Tarefa 3, na ordem de aparição da lista "SiteHeader/Footer; Hero/Categorias/Sobre; Soluções e filtros; Atendimento, Presença e CTA; e WhatsAppDialog"). `docs/PLANEJAMENTO_PROJETO.md` já nomeia esse mesmo bloco como **Incremento 5 ("Soluções e filtros")**, e confirma que "Encontre o equipamento ideal" (§3.1) é a mesma funcionalidade, não uma seção nova. Esta proposta trata Fatia 4 = Incremento 5 = seção `#solucoes` (`SolutionFilters` + `SolutionCard`).

## 0.2 Verificação de dimensões reais das imagens

| Arquivo | Dimensões declaradas/usadas no baseline | Dimensões reais verificadas |
|---|---|---|
| `alimentador-reto-fundo-plantacao-768.webp` | `srcset ... 768w` | 768×320 |
| `alimentador-reto-fundo-plantacao-1200.webp` | `srcset ... 1200w` | 1200×500 |
| `queimador.webp` | sem `width`/`height` no baseline | 1600×1200 |
| `Pesquisa/cavaco-640.webp` | sem `width`/`height` no baseline | 640×429 |
| `Pesquisa/pellets-640.webp` | sem `width`/`height` no baseline | 640×640 |

As duas variantes do card em destaque (768×320 e 1200×500) mantêm a mesma proporção (2,4:1), o que é consistente com um `sizes`/`srcset` gerado automaticamente pelo `next/image` a partir de uma única fonte de maior resolução (1200×500), sem necessidade de `srcset` manual.

## 0.3 Decisões aprovadas e ajuste obrigatório aplicado nesta revisão

- **D1: aprovada** — `SolutionsSection` (Server) + `SolutionsGrid` (Client) + componentes/dados em `src/components/solutions/`, sem alteração em relação à proposta original.
- **D2: aprovada** — filtros: Todos, Aviário, Equipamentos, Fumageiro, Piscicultura, Secadores.
- **D3: aprovada com o remapeamento definido por Jose** (substitui o placeholder da versão anterior), preservando marcação multicategoria:
  - "Alimentador de Cavaco, Briquete e Pellets" → `equipamentos` + `fumageiro`.
  - "Queimador para Estufas" → `fumageiro` + `equipamentos`.
  - "Soluções para Biomassa" → `equipamentos` (categoria única).
- **D4: aprovada conforme proposta** — estratégia de `next/image` por card mantida como descrita em §3.5/§7.
- **D5: aprovada — Opção A** (paridade exata). As duas imagens de `.split-media` mantêm `width`/`height` reais e `style={{ width: '100%', height: 'auto' }}`, sem `object-fit` novo; o corte continua a cargo do `overflow: hidden` do `.card-media` pai, exatamente como no baseline.
- **D6: aprovada com sintaxe obrigatória** — o seletor de compatibilidade do CTA de WhatsApp deve ser exatamente `.card-body :is(a, button)` (não `.card-body a, .card-body button`), preservando o `<a>` real do card em destaque e cobrindo o `<button>` do `WhatsAppTrigger` nos outros dois cards com uma única regra.
- **D7: aprovada** — copy do cabeçalho da seção mantida exatamente igual ao baseline, sem qualquer ajuste de texto nesta fatia.
- **Ajuste obrigatório e bloqueante aplicado — semântica dos botões de filtro:** a versão anterior desta proposta usava `role="tablist"`/`role="tab"`/`aria-selected` no `SolutionFilters`, replicando o baseline. Jose determinou que isso viola a regra obrigatória da Tarefa 3 de não usar semântica de abas (`tablist`/`tab`/`aria-selected`) para filtros que não são abas de conteúdo. A proposta foi corrigida (§3.4 e §5) para usar botões comuns (`<button type="button">`) com `aria-pressed` refletindo o estado do filtro ativo, sem `role` adicional no contêiner além de `aria-label="Filtrar soluções"`. Esta correção já está aplicada nas seções abaixo; nenhuma versão anterior deve ser implementada.

---

## 1. Objetivo, escopo incluído e exclusões

**Objetivo:** migrar a seção "Soluções" (`id="solucoes"`) do baseline estático para React/Next.js, preservando o filtro por categoria, os três cards de exemplo, a integração com o diálogo de WhatsApp já existente (Fatia 1/3.1) e a responsividade, e atualizando o conjunto de categorias de filtro para as cinco categorias oficiais aprovadas por Jose (`docs/PLANEJAMENTO_PROJETO.md`).

**Incluído nesta fatia:**
- `SolutionsSection` (composição da seção, cabeçalho estático).
- `SolutionsGrid` (Client Component: estado do filtro ativo, composição de `SolutionFilters` + lista de `SolutionCard`, mensagem de estado vazio).
- `SolutionFilters` (botões de filtro, presentacional).
- `SolutionCard` (card de solução, presentacional).
- Módulo de dados isolado (`solutions-data.ts`) com os três exemplos existentes e o tipo `SolutionFilterId`.
- Migração das regras de CSS de `.solutions*`, `.section-heading*`, `.solution-filters`, `.filter-button*`, `.solutions-grid`, `.solution-card*`, `.card-media*`, `.split-media*`, `.card-body*`, `.filter-empty` (base + breakpoints 1050/820/560px).
- Composição em `src/app/page.tsx`: `<SolutionsSection />` após `<AboutSection />`.

**Fora de escopo (não tocar nesta fatia):**
- "Atendimento" (`#atendimento`), "Presença" e CTA final — Incremento 6, fatia futura.
- "Novidades e dicas" — Incremento 7.
- Página de produto estática e rota `produto-alimentador.html` — Tarefa 4 (depende de decisão de slug ainda pendente); o link do card em destaque mantém o `href` literal do baseline sem alteração.
- Qualquer modelagem de dados real de produto/categoria em banco — Fase 3, não autorizada.
- Qualquer alteração de regra de negócio além da já aprovada (as cinco categorias oficiais).

---

## 2. Arquivos a serem criados ou modificados

| Arquivo | Ação |
|---|---|
| `src/components/solutions/solutions-data.ts` | Criar — tipo `SolutionFilterId`, tipo `Solution`, array `solutions` com os três exemplos do baseline recategorizados (pendente D3). |
| `src/components/solutions/SolutionFilters.tsx` | Criar — botões de filtro presentacionais. |
| `src/components/solutions/SolutionFilters.test.tsx` | Criar. |
| `src/components/solutions/SolutionCard.tsx` | Criar — card presentacional. |
| `src/components/solutions/SolutionCard.test.tsx` | Criar. |
| `src/components/solutions/SolutionsGrid.tsx` | Criar — Client Component, estado do filtro. |
| `src/components/solutions/SolutionsGrid.test.tsx` | Criar. |
| `src/components/sections/SolutionsSection.tsx` | Criar — Server Component, cabeçalho + `SolutionsGrid`. |
| `src/components/sections/SolutionsSection.test.tsx` | Criar. |
| `src/app/globals.css` | Modificar — acrescentar bloco `/* ===== Fatia 4 — Soluções e filtros ===== */` e as regras correspondentes nos três `@media` já existentes. |
| `src/app/page.tsx` | Modificar — adicionar `<SolutionsSection />`. |
| `docs/COMPONENTS.md`, `tasks/plan.md`/`tasks/todo.md` | Atualizar após aprovação/commit (não nesta etapa). |

---

## 3. Estrutura e responsabilidades

### 3.1 `solutions-data.ts`

```ts
export type SolutionFilterId =
  | 'todos'
  | 'aviario'
  | 'equipamentos'
  | 'fumageiro'
  | 'piscicultura'
  | 'secadores'

export type Solution = {
  id: string
  title: string
  categories: Exclude<SolutionFilterId, 'todos'>[]
  featured?: boolean
  tag?: string
  href: string
  ctaLabel: string
  media:
    | { kind: 'single'; src: string; alt: string; width: number; height: number; sizes: string }
    | { kind: 'split'; images: { src: string; alt: string; width: number; height: number }[] }
}

export const solutionFilters: { id: SolutionFilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'aviario', label: 'Aviário' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'fumageiro', label: 'Fumageiro' },
  { id: 'piscicultura', label: 'Piscicultura' },
  { id: 'secadores', label: 'Secadores' },
]

export const solutions: Solution[] = [
  {
    id: 'alimentador-cavaco-briquete-pellets',
    title: 'Alimentador de Cavaco, Briquete e Pellets',
    categories: ['equipamentos', 'fumageiro'],
    featured: true,
    tag: 'Lançamento',
    href: 'produto-alimentador.html',
    ctaLabel: 'Ver detalhes do alimentador de cavaco, briquete e pellets',
    media: {
      kind: 'single',
      src: '/image/alimentador-reto-fundo-plantacao-1200.webp',
      alt: 'Alimentador de cavaco, briquete e pellets em uma plantação',
      width: 1200,
      height: 500,
      sizes: '(max-width: 720px) 100vw, 66vw',
    },
  },
  {
    id: 'queimador-estufas',
    title: 'Queimador para Estufas',
    categories: ['fumageiro', 'equipamentos'],
    href: '#whatsapp-dialog',
    ctaLabel: 'Solicitar informações sobre queimadores',
    media: {
      kind: 'single',
      src: '/image/queimador.webp',
      alt: 'Equipamento FortSul em ambiente de produção',
      width: 1600,
      height: 1200,
      sizes: '(max-width: 560px) 100vw, (max-width: 1050px) 50vw, 33vw',
    },
  },
  {
    id: 'solucoes-biomassa',
    title: 'Soluções para Biomassa',
    categories: ['equipamentos'],
    href: '#whatsapp-dialog',
    ctaLabel: 'Solicitar informações sobre soluções para biomassa',
    media: {
      kind: 'split',
      images: [
        { src: '/image/Pesquisa/cavaco-640.webp', alt: 'Cavaco de madeira', width: 640, height: 429 },
        { src: '/image/Pesquisa/pellets-640.webp', alt: 'Pellets de madeira', width: 640, height: 640 },
      ],
    },
  },
]
```

Os dois cards não destacados usam `href: '#whatsapp-dialog'` apenas como marcador de intenção — na implementação, `SolutionCard` decide renderizar `WhatsAppTrigger` (não uma âncora real) sempre que `featured` for `false`/ausente, conforme §3.5.

Justificativa: dados isolados em módulo próprio, não embutidos no componente visual (`CLAUDE.md` §8 — "componente visual deve receber dados prontos"). `SolutionCard`/`SolutionFilters` recebem props prontas, sem decidir taxonomia.

### 3.2 `SolutionsSection` (Server Component)

Renderiza `<section className="solutions" id="solucoes">`, o `container`, o bloco `section-heading` (eyebrow + `h2` + parágrafo, conteúdo estático do baseline — texto exato conforme D7) envolto em `Reveal`, e `<SolutionsGrid filters={solutionFilters} solutions={solutions} />`. Sem estado, sem `"use client"`.

### 3.3 `SolutionsGrid` (Client Component)

```tsx
'use client'
// estado: activeFilter (SolutionFilterId, inicial 'todos')
// renderiza <SolutionFilters filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
// calcula visibleSolutions = activeFilter === 'todos' ? solutions : solutions.filter(s => s.categories.includes(activeFilter))
// renderiza grid de <SolutionCard> (todas as solutions, aplicando classe/atributo de ocultação às não visíveis,
//   preservando a ordem original — paridade com o comportamento do baseline, que usa display:none via classe
//   .is-hidden em vez de remover do DOM)
// renderiza <p className="filter-empty" hidden={visibleSolutions.length > 0}>Nenhuma solução desta categoria nesta apresentação.</p>
```

Preserva o comportamento do baseline de não remover cards do DOM (usa `.is-hidden`/`display:none` via classe condicional), para manter a mesma semântica de teste já aprovada ("ordem preservada").

### 3.4 `SolutionFilters` (presentacional)

Props: `filters: { id: SolutionFilterId; label: string }[]`, `activeFilter: SolutionFilterId`, `onFilterChange: (id: SolutionFilterId) => void`. Renderiza `<div className="solution-filters" aria-label="Filtrar soluções">` (sem `role`) com um `<button type="button">` comum por filtro — **não** `role="tab"`, **não** `role="tablist"` no contêiner, **não** `aria-selected`. O estado ativo é expresso por `aria-pressed={activeFilter === filter.id}` em cada botão, com `className` (`filter-button`/`filter-button active`) calculado a partir do mesmo booleano. `data-filter={filter.id}` preservado para paridade com o baseline. Esta é a semântica correta para um grupo de botões de alternância (filtro), diferente de abas de conteúdo — ajuste obrigatório determinado por Jose, documentado em §0.3.

### 3.5 `SolutionCard` (presentacional)

Props conforme `docs/COMPONENTS.md` §3.6: `title`, `category` (lista, para `data-category` equivalente), `media`, `href`/`ctaLabel`, `featured`, `tag`. Renderiza `<article className={...} data-category={categories.join(' ')}>` envolto em `Reveal` (com `delay` no segundo card, como no baseline), `.card-media` com `next/image`:

- `media.kind === 'single'`: `fill` + `sizes={media.sizes}`, `object-fit: cover` via `.card-media > img` (CSS já correta no baseline).
- `media.kind === 'split'`: duas `next/image` dentro de `.split-media`, cada uma com `width`/`height` reais e `style={{ width: '100%', height: 'auto' }}` — sem `fill`, sem `object-fit` novo (D5, Opção A).

`.card-tag` quando `tag` existir. `.card-body` com título/categoria e CTA: `<a href={href}>` real apenas no card em destaque (`featured === true`); `WhatsAppTrigger` (className cobrindo o mesmo estilo via D6) nos outros dois, com `ariaLabel={ctaLabel}`.

---

## 4. Estratégia de migração de CSS

Reaproveitar a estrutura já estabelecida na Fatia 3: novo bloco nomeado `/* ===== Fatia 4 — Soluções e filtros ===== */` para as regras de base, e as regras responsivas inseridas nos três `@media` já existentes (`1050px`, `820px`, `560px`) em `src/app/globals.css`, sem criar novos blocos de media query.

Regras a portar (idênticas ao baseline, exceto onde indicado):

- `.solutions`, `.solutions::before`, `.section-heading`, `.section-heading h2`, `.section-heading > p`, `.solution-filters`, `.filter-button`, `.filter-button:hover, .filter-button.active`, `.solutions-grid`, `.solution-card`, `.solution-card:hover`, `.solution-card.is-hidden`, `.card-media`, `.featured .card-media`, `.card-media > img`, `.solution-card:hover .card-media > img`, `.solution-card:not(.featured):nth-child(2) .card-media img`, `.card-tag`, `.split-media`, `.split-media img`, `.card-body`, `.card-body span`, `.card-body h3`, `.card-body :is(a, button)` (substitui `.card-body a` do baseline — ver D6), `.card-body :is(a, button):hover` (substitui `.card-body a:hover`), `.card-body svg`, `.filter-empty`.
- Breakpoint 1050px: `.solutions-grid { grid-template-columns: 1fr 1fr; }`, `.solution-card.featured { grid-column: 1 / -1; }`, `.featured .card-media { height: 400px; }`.
- Breakpoint 820px: a regra combinada do baseline `.section-heading, .cta-inner { align-items: flex-start; flex-direction: column; }` deve ser **desmembrada**, portando apenas `.section-heading { align-items: flex-start; flex-direction: column; }` nesta fatia (mesmo tratamento já aplicado a `.about-grid, .presence-grid` na Fatia 3 — `.cta-inner` pertence a um incremento futuro). O mesmo vale para `.section-heading > p { width: auto; max-width: 450px; }`, que é portada integralmente (não é uma regra combinada).
- Breakpoint 560px: `.section-heading h2 br, .support-heading h2 br { display: none; }` desmembrada para `.section-heading h2 br { display: none; }` (mesmo motivo — `.support-heading` é Incremento 6). `.solutions-grid { grid-template-columns: 1fr; }`, `.solution-card.featured { grid-column: auto; }`, `.featured .card-media, .card-media { height: 270px; }`, `.card-body { min-height: 115px; padding: 19px; }`, `.card-body h3 { font-size: 18px; }`.

Nenhuma regra de `.support*`, `.content-*`, `.presence-*`, `.footer-*`, `.map-*`, `.cta-*` é tocada.

---

## 5. Contrato de testes proposto

**`SolutionFilters.test.tsx`**
1. Renderiza um botão comum (`type="button"`, sem `role="tab"`) por filtro, na ordem recebida via prop; o contêiner não tem `role="tablist"`.
2. O filtro cujo `id` é igual a `activeFilter` tem `aria-pressed="true"` e classe `active`; os demais têm `aria-pressed="false"`. Nenhum botão ou contêiner usa `aria-selected`.
3. Clicar em um botão chama `onFilterChange` com o `id` correspondente.

**`SolutionsGrid.test.tsx`** (contrato revisado com as cinco categorias oficiais, substitui a referência desatualizada a `biomassa|fumageiro|equipamentos`)
1. Estado inicial: filtro "Todos" ativo, todos os cards visíveis, mensagem de vazio oculta.
2. Filtragem: selecionar uma categoria oculta (classe/atributo) os cards que não a contêm em `categories`, mantendo visíveis apenas os que a contêm.
3. Restauração via "Todos": após filtrar, clicar em "Todos" volta a exibir todos os cards.
4. Ordem preservada: a ordem dos cards no DOM não muda ao filtrar (apenas visibilidade).
5. Estado vazio: selecionar uma categoria sem nenhum card correspondente exibe a mensagem `.filter-empty` e oculta todos os cards.
6. Exclusividade do filtro ativo: apenas um botão tem `aria-pressed="true"`/classe `active` por vez.

**`SolutionCard.test.tsx`**
1. Renderiza título, categoria(s) e `data-category`.
2. Card com `featured` recebe a classe/tag correspondente (`featured`, `.card-tag` quando `tag` fornecido).
3. Card em destaque renderiza `<a>` com `href` do produto; os demais renderizam `WhatsAppTrigger` (verificar `aria-haspopup="dialog"` conforme componente já testado em `whatsapp-flow.test.tsx`), e ambos os tipos de CTA recebem o estilo circular de `.card-body :is(a, button)` (D6).
4. Imagem: `alt` presente e correspondente à prop; card em destaque e "Queimador" usam `fill`+`sizes`; card "Soluções para Biomassa" usa duas imagens com `width`/`height` reais e sem `fill` (D5, Opção A).

**`SolutionsSection.test.tsx`**
1. `getByRole('region').id === 'solucoes'` (ou `getByRole('heading', {level:2})` conforme padrão usado nas fatias anteriores).
2. Cabeçalho (`eyebrow`, `h2`, parágrafo) presente com o texto aprovado (D7).
3. `SolutionsGrid` renderizado com os filtros e soluções corretos.

---

## 6. Validações automatizadas e manuais

Mesmas exigidas nas fatias anteriores: `npm run typecheck`, `npm run build`, `npm test` (suíte completa), verificação visual em desktop/tablet/mobile (grid de 3/2/1 colunas conforme breakpoints), verificação manual do filtro no navegador (clique em cada categoria, incluindo as que retornam estado vazio), verificação do CTA de WhatsApp nos dois cards não destacados (abre o mesmo diálogo único, sem duplicar), e confirmação de que o link do card em destaque aponta para `produto-alimentador.html` sem alteração.

---

## 7. Riscos, decisões pendentes e proposta de commit atômico

### Decisões aprovadas por Jose (D1–D7) e ajuste obrigatório aplicado

- **D1: aprovada — Arquitetura de componentes:** `SolutionsSection` (Server) + `SolutionsGrid` (Client, `'use client'`, estado do filtro) + `SolutionFilters`/`SolutionCard` (presentacionais) + `solutions-data.ts` isolado, em novo diretório de domínio `src/components/solutions/`. Segue exatamente os nomes/props já documentados em `docs/COMPONENTS.md` §3.5/3.6.

- **D2: aprovada — Conjunto de categorias do filtro:** `SolutionFilterId` = `todos | aviario | equipamentos | fumageiro | piscicultura | secadores`; botões renderizam "Todos" + as cinco categorias oficiais, na ordem de `docs/PLANEJAMENTO_PROJETO.md` §4.3.

- **D3: aprovada — Mapeamento de categoria dos três cards existentes** (substitui `biomassa`, que não é categoria oficial), preservando marcação multicategoria:
  - "Alimentador de Cavaco, Briquete e Pellets" → `equipamentos` + `fumageiro`.
  - "Queimador para Estufas" → `fumageiro` + `equipamentos`.
  - "Soluções para Biomassa" → `equipamentos` (categoria única).
  Nomes de produto e textos alternativos que mencionam "biomassa" como descrição do produto (ex.: `alt`, `aria-label`, título "Soluções para Biomassa") não são afetados — só a taxonomia de filtro (`categories`) muda. Refletido em §3.1.

- **D4: aprovada — Estratégia de `next/image` por card:**
  - Card em destaque (1200×500 disponível, mesma proporção 2,4:1 em 768×320): `fill` + `sizes="(max-width: 720px) 100vw, 66vw"`, `object-fit: cover` via `.card-media > img` (regra já correta no baseline, aplicada a elemento `img`, sem bug de `background-position` como o do Hero).
  - Card "Queimador" (1600×1200, resolução única): `fill` + `sizes="(max-width: 560px) 100vw, (max-width: 1050px) 50vw, 33vw"` (aproximação da largura real da coluna em cada breakpoint).
  - Card "Soluções para Biomassa" (duas imagens lado a lado): ver D5.

- **D5: aprovada — Opção A (paridade exata) para o `split-media`:** `next/image` com `width`/`height` reais (640×429 e 640×640) e `style={{ width: '100%', height: 'auto' }}`, sem `fill`, sem `object-fit` novo; o `overflow: hidden` do `.card-media` pai continua cortando exatamente como no baseline. Nenhuma mudança visual em relação ao site atual.

- **D6: aprovada com sintaxe obrigatória — seletor `.card-body :is(a, button)`:** os dois CTAs de WhatsApp dentro de `.card-body` hoje são `<a>` no baseline, mas serão renderizados como `<button>` pelo `WhatsAppTrigger` já compartilhado (mesmo padrão usado em `SiteHeader`/`SiteFooter`). Jose determinou o uso da sintaxe `:is()` (`.card-body :is(a, button)` e `.card-body :is(a, button):hover`), em vez de duas regras separadas, preservando o `<a>` real do card em destaque e cobrindo o `<button>` dos outros dois cards com uma única declaração. Mudança puramente de compatibilidade de seletor, sem alteração de resultado visual.

- **D7: aprovada — Copy do cabeçalho da seção:** manter o texto exato do baseline ("Nossas soluções" / "Equipamentos pensados para o seu processo." / "Escolha uma área para explorar as possibilidades da linha FortSul."), sem qualquer ajuste de texto nesta fatia. A eventual renomeação para "Encontre o equipamento ideal" (`docs/PLANEJAMENTO_PROJETO.md` §3.1) permanece em aberto para uma fatia/ajuste futuro, não decidida agora.

- **Ajuste obrigatório aplicado — semântica dos botões de filtro:** `SolutionFilters` usa botões comuns (`<button type="button">`) com `aria-pressed` refletindo o filtro ativo, sem `role="tablist"`, `role="tab"` nem `aria-selected` — correção determinada por Jose por violar a regra obrigatória da Tarefa 3 sobre semântica de filtros (não são abas de conteúdo). Aplicado em §3.4 e §5.

### Riscos

- **R1:** card em destaque aponta para `produto-alimentador.html`, uma rota que não existe no app Next.js (Tarefa 4 ainda não fez essa migração). Mitigação: manter o `href` literal do baseline sem alteração; o link permanece funcional apenas enquanto o site estático coexistir no repositório, comportamento idêntico ao atual, não uma regressão desta fatia.
- **R2:** divergência entre a ordem de exibição das categorias no `CategoryStrip` (Fatia 3, ordem visual do baseline: Aviário, Secadores, Fumageiro, Piscicultura, Equipamentos) e a ordem oficial dos filtros nesta fatia (Aviário, Equipamentos, Fumageiro, Piscicultura, Secadores, ordem de `docs/PLANEJAMENTO_PROJETO.md`) — já documentado como intencional na Fatia 3 (§3.3 da proposta anterior), não é uma inconsistência a corrigir.
- **R3:** com o mapeamento de D3, nenhum card usa `aviario`, `piscicultura` ou `secadores` — filtrar por essas três categorias hoje sempre resulta em estado vazio. Isso é esperado e deve ser coberto pelo caso 5 do contrato de `SolutionsGrid.test.tsx` (§5); não é uma regressão, apenas reflete o catálogo reduzido da Fase 2 (crescerá na Fase 3).

### Proposta de commit atômico

Um único commit ao final da implementação, no padrão:

```text
feat: implementar SolutionsSection com filtro de categorias (Tarefa 3.4)
```

---

## 8. Bloco de status

Status: **APROVADA — AGUARDANDO IMPLEMENTAÇÃO**. Todas as decisões (D1–D7) foram aprovadas por Jose, incluindo o mapeamento definitivo de categorias (D3) e a correção obrigatória de semântica dos botões de filtro (`aria-pressed`, sem `tablist`/`tab`/`aria-selected`). Nenhum código foi criado ou alterado por esta proposta; a implementação fica a cargo do Codex, seguida de revisão técnica do Claude antes de qualquer commit.
