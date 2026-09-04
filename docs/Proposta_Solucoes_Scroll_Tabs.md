# Proposta técnica — Redesign de `#solucoes` (tabs animadas + scroll horizontal)

Status: **APROVADO POR JOSE EM 03/09/2026 PARA SEGUIR COM O PACOTE COMPLETO, INCLUSIVE ADOÇÃO DE `motion` COMO DEPENDÊNCIA — IMPLEMENTAÇÃO AINDA NÃO INICIADA.**
Data: 03/09/2026
Worktree: `.worktrees/solucoes-scroll-tabs` (branch `feature/solucoes-scroll-tabs`, criada a partir de `main`@`2700435`, sem código de produção ainda).

Esta proposta formaliza e adapta ao código real do projeto a ideia trazida por Jose (inspirada em dois componentes do 21st.dev — AnimatedTabs de `@chetanverma16` e um scroller horizontal de `@minhxthanh`, adaptado de vertical para horizontal): trocar os filtros/grid atuais da seção `#solucoes` por tabs animadas com indicador deslizante e um carrossel horizontal controlado por scroll vertical da página ("scroll-jacking").

## 0. Contexto e decisão já registrada

- Existe precedente direto neste repositório: `docs/BACKLOG_FUNCIONALIDADES_FUTURAS.md`, item 1, avaliou um padrão da mesma família (scroll-pin) em 27/08/2026 e recomendou adiar por catálogo raso e risco de CLS/Lighthouse. Jose revisou esse precedente e decidiu **seguir mesmo assim** com o catálogo atual (3 produtos reais, 3 das 6 categorias — Aviário, Piscicultura, Secadores — sem nenhum produto hoje). Isso não é esquecimento; é decisão explícita registrada aqui.
- O `scope-gate-reviewer` classificou a mudança como estrutural (nova dependência + novo padrão de arquitetura de componente + mudança de navegação) e exigiu aprovação explícita antes de codar. Esta proposta é essa aprovação formalizada, seguindo o mesmo formato usado em `docs/Proposta_Tarefa_4_Fatia_4_2.md`.
- Decisão formal de dependência: adotar **`motion`** (não `framer-motion`). `framer-motion` está **descontinuado no npm** — o pacote atual e mantido é `motion`, importado de `motion/react` (confirmado via Context7/`motion.dev`, doc "Upgrade guide": *"Uninstall the deprecated `framer-motion` package and install the new unified `motion` package"*). Instalar `framer-motion` hoje instalaria um pacote legado. `npm view motion peerDependencies` confirma compatibilidade com React 19 (`"react": "^18.0.0 || ^19.0.0"`), a versão usada no projeto.
- Esta será a primeira dependência de UI/animação do frontend (fora de `@prisma/client`/`prisma`, que são de dados). Fica registrado aqui como decisão de stack, não decisão do agente.

## 1. Escopo desta proposta

### 1.1 Incluído

1. `npm install motion` (dependency, não devDependency).
2. Novo componente de tabs acessível com indicador animado (`layoutId`), substituindo `SolutionFilters`.
3. Novo componente de carrossel horizontal controlado por scroll vertical (`useScroll`/`useTransform` + `sticky`), substituindo o grid CSS estático para telas ≥ 821px.
4. Fallback nativo (`overflow-x: auto` + `scroll-snap`) para telas ≤ 820px (mesmo breakpoint já usado no menu mobile, `styles.css`/`globals.css`) e para `prefers-reduced-motion: reduce`.
5. Reuso de `solutions-data.ts` sem nenhuma mudança de schema, e reuso do `SolutionCard` existente sem redesenho visual.
6. Atualização dos testes afetados (`SolutionsGrid.test.tsx`) e testes novos para os componentes novos.
7. Ajustes de CSS em `src/app/globals.css` (plano, sem Tailwind — o projeto ainda não adotou Tailwind; ver `docs/PLANO_MESTRE_FORTSULSC.md` linha 6/182).

### 1.2 Excluído (fora desta proposta)

- Qualquer produto novo, imagem nova ou categoria nova — o catálogo é exatamente o de `solutions-data.ts` hoje.
- Qualquer mudança em `SolutionCard`'s dados/props além do estritamente necessário para funcionar dentro da trilha horizontal (ver seção 4).
- Adoção de Tailwind — fora de escopo; todo CSS novo segue o padrão atual de classes globais.
- Qualquer alteração em outras seções da Home.

## 2. Precedente interno a reaproveitar: `AboutTabs`

`src/components/about/AboutTabs.tsx` já implementa um padrão de tabs acessível **sem nenhuma dependência**: `role="tablist"`/`role="tab"`, `aria-selected`, `aria-controls`, navegação por teclado (`ArrowLeft`/`ArrowRight`/`Home`/`End`) com `tabIndex` móvel e `ref` por aba para foco programático. O novo componente de tabs de Soluções **estende esse mesmo padrão de acessibilidade e teclado** (mesma lógica de `handleKeyDown`), acrescentando apenas o indicador animado via `motion`. Isso evita reinventar a navegação por teclado e mantém os dois conjuntos de tabs do site consistentes entre si.

## 3. Arquitetura de componentes

```
SolutionsSection (Server Component, inalterado — apenas passa solutions/solutionFilters)
 └── SolutionsGrid ('use client', reescrito — orquestra estado de categoria)
      ├── CategoryTabs (novo, substitui SolutionFilters)
      └── ProductScroller (novo, substitui a renderização estática do grid)
           └── SolutionCard (existente, reaproveitado sem mudança de props)
```

Arquivos:

- **Novo:** `src/components/solutions/CategoryTabs.tsx` (+ `CategoryTabs.test.tsx`)
- **Novo:** `src/components/solutions/ProductScroller.tsx` (+ `ProductScroller.test.tsx`)
- **Reescrito:** `src/components/solutions/SolutionsGrid.tsx`
- **Removido:** `src/components/solutions/SolutionFilters.tsx` (substituído por `CategoryTabs`; remover também `SolutionFilters.test.tsx`, migrando seus casos para `CategoryTabs.test.tsx`)
- **Inalterados:** `src/components/sections/SolutionsSection.tsx`, `src/components/solutions/solutions-data.ts`, `src/components/solutions/SolutionCard.tsx`

## 4. `CategoryTabs` — especificação

```tsx
'use client'

import { useRef, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { SolutionFilterId } from './solutions-data'

type Filter = { id: SolutionFilterId; label: string }

export function CategoryTabs({
  filters,
  activeFilter,
  onFilterChange,
}: {
  filters: Filter[]
  activeFilter: SolutionFilterId
  onFilterChange: (id: SolutionFilterId) => void
}) {
  const shouldReduceMotion = useReducedMotion()
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = filters.length - 1
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex
    if (nextIndex === null) return

    event.preventDefault()
    const nextFilter = filters[nextIndex]
    onFilterChange(nextFilter.id)
    tabRefs.current[nextFilter.id]?.focus()
  }

  return (
    <div className="solution-tablist" role="tablist" aria-label="Filtrar soluções">
      {filters.map((filter, index) => {
        const isActive = filter.id === activeFilter
        return (
          <button
            key={filter.id}
            ref={(node) => { tabRefs.current[filter.id] = node }}
            type="button"
            role="tab"
            id={`solution-tab-${filter.id}`}
            aria-selected={isActive}
            aria-controls="solution-panel"
            tabIndex={isActive ? 0 : -1}
            className={`solution-tab${isActive ? ' active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {isActive && !shouldReduceMotion && (
              <motion.span
                layoutId="solution-tab-indicator"
                className="solution-tab-indicator"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="solution-tab-label">{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}
```

Notas:

- O indicador é renderizado **dentro** do botão ativo (`position: absolute; inset: 0` via CSS, `z-index` abaixo do texto) — o `motion` mede a posição real do elemento com `layoutId` entre renders e anima a transição sozinho, sem cálculo manual de posição/largura.
- Com `prefers-reduced-motion`, o indicador não usa `motion.span`; a classe `.active` (CSS puro, já existente hoje em `.filter-button.active`) cobre o estado ativo sem animação.
- `aria-controls="solution-panel"` aponta para o `id` do container do `ProductScroller` (seção 5) — um único painel visível por vez, mesmo padrão ARIA de tabs simples (não é `tabpanel` por categoria porque só uma trilha é renderizada por vez).

### CSS (`globals.css`, substitui `.solution-filters`/`.filter-button`)

```css
.solution-tablist { display: flex; flex-wrap: nowrap; gap: 7px; margin: 47px 0 27px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; }
.solution-tablist::-webkit-scrollbar { display: none; }
.solution-tab { position: relative; flex: 0 0 auto; padding: 10px 18px; border: 1px solid rgba(255,255,255,.18); border-radius: 6px; background: transparent; color: rgba(255,255,255,.65); font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer; transition: color .2s, border-color .2s; }
.solution-tab.active { border-color: var(--orange); color: var(--white); }
.solution-tab:hover:not(.active) { border-color: rgba(255,255,255,.32); }
.solution-tab-indicator { position: absolute; inset: 0; z-index: 0; border-radius: 5px; background: var(--orange); }
.solution-tab-label { position: relative; z-index: 1; }
```

Mantém a paleta/raio já aprovados (`var(--orange)`, `border-radius: 6px` igual ao `.filter-button` atual); a única mudança visual é o preenchimento deslizar entre abas em vez de trocar instantaneamente.

## 5. `ProductScroller` — especificação

### 5.1 Contrato de props

```tsx
type ProductScrollerProps = {
  products: Solution[] // já filtrado pelo pai (SolutionsGrid) para a categoria ativa
  activeFilter: SolutionFilterId // só para resetar a trilha ao trocar de categoria
}
```

`SolutionsGrid` continua sendo o único lugar que calcula `filteredSolutions` (mesma lógica de hoje: `activeFilter === 'todos' ? solutions : solutions.filter(s => s.categories.includes(activeFilter))`).

### 5.2 Modos de operação

Três modos, decididos antes de qualquer cálculo de scroll:

1. **Vazio** (`products.length === 0`): renderiza `<p className="filter-empty">Nenhuma solução desta categoria nesta apresentação.</p>` (texto e classe inalterados) e nada mais. Sem sticky, sem altura extra.
2. **Compacto** (`products.length === 1` OU `horizontalTravel` calculado ficar em `0` OU `prefers-reduced-motion` OU viewport ≤ 820px): renderiza a trilha em fluxo normal, sem `sticky`, sem altura extra de seção. Em telas ≤ 820px a trilha usa `overflow-x: auto; scroll-snap-type: x mandatory` (scroll nativo, tátil); nos demais casos "compactos" (1 produto, ou trilha cabe inteira no viewport) a trilha simplesmente não tem overflow — não faz sentido nenhum tipo de scroll.
3. **Scroll-driven** (todo o resto: 2+ produtos, `horizontalTravel > 0`, motion completo permitido, viewport > 820px): pinning + `useScroll`/`useTransform`, especificado abaixo.

### 5.3 Cálculo de distância e altura (modo scroll-driven)

```tsx
'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { SolutionCard } from './SolutionCard'
import type { Solution, SolutionFilterId } from './solutions-data'

const COMPACT_BREAKPOINT = '(max-width: 820px)'
const SCROLL_LENGTH_MULTIPLIER = 1.15

export function ProductScroller({ products, activeFilter }: { products: Solution[]; activeFilter: SolutionFilterId }) {
  const shouldReduceMotion = useReducedMotion()
  const [isCompactViewport, setIsCompactViewport] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [horizontalTravel, setHorizontalTravel] = useState(0)
  const previousFilterRef = useRef<SolutionFilterId | null>(null)

  useLayoutEffect(() => {
    const media = window.matchMedia(COMPACT_BREAKPOINT)
    const update = () => setIsCompactViewport(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const calculate = () => {
      setHorizontalTravel(Math.max(0, track.scrollWidth - viewport.clientWidth))
    }

    calculate()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(calculate)
    observer.observe(viewport)
    observer.observe(track)
    return () => observer.disconnect()
  }, [activeFilter, products.length])

  const isScrollDriven = products.length > 1 && horizontalTravel > 0 && !shouldReduceMotion && !isCompactViewport

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -horizontalTravel])

  useLayoutEffect(() => {
    if (previousFilterRef.current === null) {
      previousFilterRef.current = activeFilter
      return
    }
    if (previousFilterRef.current === activeFilter) return
    previousFilterRef.current = activeFilter

    const section = sectionRef.current
    if (!section) return

    const headerOffset = document.querySelector('.nav-wrap.is-sticky')?.getBoundingClientRect().height ?? 0
    const top = section.getBoundingClientRect().top + window.scrollY - headerOffset

    window.scrollTo({ top, behavior: shouldReduceMotion ? 'auto' : 'smooth' })
  }, [activeFilter, shouldReduceMotion])

  if (products.length === 0) {
    return <p className="filter-empty">Nenhuma solução desta categoria nesta apresentação.</p>
  }

  if (!isScrollDriven) {
    return (
      <div id="solution-panel" role="tabpanel" aria-label="Soluções" className={`solution-track-static${isCompactViewport ? ' is-snap' : ''}`}>
        {products.map((solution) => (
          <div key={solution.id} className="solution-track-item">
            <SolutionCard solution={solution} />
          </div>
        ))}
      </div>
    )
  }

  const viewportHeight = typeof window === 'undefined' ? 800 : window.innerHeight
  const scrollLength = Math.max(viewportHeight * 1.2, horizontalTravel * SCROLL_LENGTH_MULTIPLIER)

  return (
    <div ref={sectionRef} className="solution-scroll-section" style={{ height: `calc(100vh + ${scrollLength}px)` }}>
      <div ref={viewportRef} id="solution-panel" role="tabpanel" aria-label="Soluções" className="solution-scroll-viewport">
        <motion.div ref={trackRef} style={{ x }} className="solution-track will-change-transform">
          {products.map((solution) => (
            <div key={solution.id} className="solution-track-item">
              <SolutionCard solution={solution} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
```

Pontos importantes já resolvidos no código acima (respondem às perguntas em aberto da revisão anterior):

- **Reset ao trocar categoria** só dispara a partir da segunda mudança real (`previousFilterRef`), nunca no mount — evita pular a página ao carregar.
- **Offset do header fixo**: `NavWrap` vira `position: fixed` via a classe `.is-sticky` (`src/components/layout/NavWrap.tsx`); o cálculo do `top` do reset de scroll subtrai a altura real do header quando ele está fixo, mesma técnica que o próprio `NavWrap` já usa para medir a si mesmo.
- **`scroll-behavior: smooth` global** (`html`, `globals.css`): o `window.scrollTo({ behavior: 'smooth' })` do reset herda esse comportamento; como é a mesma diretiva já usada em toda âncora do site, não há conflito novo — só precisa respeitar `prefers-reduced-motion` (`behavior: 'auto'` nesse caso, e o bloco `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }` já existente cobre isso globalmente).
- **jsdom/testes**: `typeof ResizeObserver === 'undefined'` guarda o `ResizeObserver` (jsdom não implementa por padrão), igual ao padrão já usado em `Reveal.tsx` para `IntersectionObserver`. Sem o observer, `horizontalTravel` fica em `0` e o componente cai automaticamente no modo compacto/estático — os testes continuam renderizando os cards sem precisar mockar layout.

### 5.4 CSS (`globals.css`)

```css
.solution-scroll-section { position: relative; width: 100%; }
.solution-scroll-viewport { position: sticky; top: 0; height: 100vh; overflow: hidden; display: flex; align-items: center; }
.solution-track { display: flex; flex-direction: row; align-items: stretch; gap: 18px; width: max-content; padding-inline: var(--container-inline, 24px) 8vw; }
.solution-track-static { display: flex; flex-direction: row; gap: 18px; padding-block: 4px; }
.solution-track-static.is-snap { overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.solution-track-static.is-snap::-webkit-scrollbar { display: none; }
.solution-track-static.is-snap .solution-track-item { scroll-snap-align: start; }
.solution-track-item { flex: 0 0 auto; width: 86vw; }
@media (min-width: 640px) { .solution-track-item { width: 62vw; } }
@media (min-width: 1050px) { .solution-track-item { width: 38vw; } }
@media (min-width: 1400px) { .solution-track-item { width: 30vw; } }
```

`.solution-card` continua exatamente como está (`SolutionCard.tsx` não muda) — a largura responsiva vive no wrapper `.solution-track-item`, não no card em si, para não afetar o card em nenhum outro lugar do site onde ele for reaproveitado no futuro.

## 6. `SolutionsGrid` — reescrita (orquestração)

```tsx
'use client'

import { useState } from 'react'
import { CategoryTabs } from './CategoryTabs'
import { ProductScroller } from './ProductScroller'
import type { Solution, SolutionFilterId } from './solutions-data'
import { Reveal } from '@/components/ui/Reveal'

export function SolutionsGrid({ filters, solutions }: { filters: { id: SolutionFilterId; label: string }[]; solutions: Solution[] }) {
  const [activeFilter, setActiveFilter] = useState<SolutionFilterId>('todos')
  const filteredSolutions = activeFilter === 'todos' ? solutions : solutions.filter((solution) => solution.categories.includes(activeFilter))

  return (
    <>
      <Reveal className="solution-tablist-wrap"><CategoryTabs filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter} /></Reveal>
      <ProductScroller products={filteredSolutions} activeFilter={activeFilter} />
    </>
  )
}
```

Diferença de comportamento em relação a hoje: os cards **não ficam mais todos montados no DOM com `.is-hidden`** — só os produtos da categoria ativa são renderizados (necessário para o cálculo de `scrollWidth` da trilha fazer sentido). Isso é intencional e é o motivo da atualização de testes na seção 7.

## 7. Testes a atualizar/criar

- **`SolutionsGrid.test.tsx`** (reescrito): trocar as asserções de `.is-hidden`/contagem fixa de `getAllByRole('article')` por: (a) trocar de aba via clique e via teclado (`ArrowRight`/`Home`/`End`) e confirmar que `getAllByRole('article')` reflete só os produtos da categoria ativa; (b) categoria vazia (Aviário) mostra o texto `"Nenhuma solução desta categoria nesta apresentação."`; (c) `aria-selected`/`tabIndex` corretos por aba.
- **`CategoryTabs.test.tsx`** (novo): `role="tablist"`/`role="tab"`, `aria-selected`, navegação por teclado idêntica à de `AboutTabs.test.tsx` (reaproveitar os mesmos casos de teste, adaptados).
- **`ProductScroller.test.tsx`** (novo): modo vazio renderiza o texto de estado vazio; modo compacto (jsdom sem `ResizeObserver`/`layout` real, então sempre cai aqui) renderiza um `article` por produto via `SolutionCard`; `id="solution-panel"` presente e compatível com `aria-controls` de `CategoryTabs`.
- **`SolutionCard.test.tsx`**: sem mudança de contrato esperada — confirmar que continua passando sem alteração, já que `SolutionCard.tsx` não muda.

## 8. Riscos e critérios de aceite (herdados do precedente do backlog)

Mesmo critério já formalizado em `docs/BACKLOG_FUNCIONALIDADES_FUTURAS.md` item 1.8 para o padrão de pinning, aplicado aqui:

- **Performance/CLS**: Lighthouse Performance ≥ 0,90 na Home após a mudança (medir antes/depois). Nenhuma propriedade além de `transform` é animada por scroll (`x` via `useTransform`); a altura da seção é reservada via `style` inline calculado no primeiro layout effect, antes da primeira pintura visível pelo usuário (SSR renderiza a seção sem altura customizada — `height` só aplicado no client após montagem; aceitar um CLS pequeno nesse primeiro cálculo é esperado e deve ser medido, não assumido como zero).
- **Acessibilidade**: scroll-jacking é anti-padrão conhecido para leitores de tela e navegação por teclado — mitigado por: (a) modo compacto sempre disponível como fallback determinístico (reduced motion, mobile, poucos produtos); (b) os cards continuam focáveis e navegáveis por Tab normalmente mesmo durante o pinning (não há `tabindex="-1"` nos cards); (c) nenhum `preventDefault` em wheel/touch — o "scroll-jacking" aqui é 100% baseado em posição de scroll real da página (`useScroll`), não em interceptação de evento.
- **Dado real insuficiente**: aceito por decisão explícita de Jose (seção 0). Consequência aceita: Aviário/Piscicultura/Secadores mostram o estado vazio até a Fase 3 popular o catálogo; "Todos" e as categorias com produto usam o modo scroll-driven normalmente (3 produtos em "Todos"/"Equipamentos" ainda geram `horizontalTravel > 0` na maioria dos viewports, então o efeito aparece, só que com trilha curta).
- **Degradação de rede/script**: se `motion` falhar ao carregar (cenário raro com bundling local via npm, diferente do CDN do precedente GSAP), o React não teria o componente montado — comportamento aceito é igual ao de qualquer outra dependência client-side já presente no bundle Next.js; não há fallback adicional a construir para isso.

## 9. Como rodar/validar

```bash
cd .worktrees/solucoes-scroll-tabs
npm install
npm run typecheck
npm run test:unit
npm run test:static
npm run dev   # inspeção visual manual: desktop largo, laptop, tablet, mobile; 0/1/2/3 produtos por categoria
npm run build # confirmar que o build de produção (webpack) não quebra com `motion`
```

Validações manuais a cargo de Jose antes de aprovar o merge: Lighthouse (Performance ≥ 0,90) na Home publicada em preview; teste de teclado (Tab, setas, Home/End) nas tabs; teste de leitor de tela básico (VoiceOver/NVDA) confirmando que o painel é anunciado corretamente ao trocar de aba; confirmar que não existe scrollbar horizontal na página em nenhum breakpoint.

## 10. Bloco de status

Status: **PACOTE COMPLETO APROVADO POR JOSE EM 03/09/2026**, incluindo a decisão de adotar `motion` (não `framer-motion`, que está descontinuado) como primeira dependência de UI do frontend, e a decisão de lançar com o catálogo atual (3 produtos, 3 categorias vazias) em vez de esperar a Fase 3. Especificação de componentes, CSS e contrato de testes detalhados nesta proposta. **Implementação ainda não iniciada.**

Fluxo a partir daqui:

1. Codex implementa na worktree já criada (`feature/solucoes-scroll-tabs` / `.worktrees/solucoes-scroll-tabs`), seguindo os contratos de componente (seções 4-6), CSS (seções 4.1/5.4) e testes (seção 7) desta proposta;
2. após implementação, rodar as validações da seção 9 (incluindo Lighthouse e teste de teclado/leitor de tela);
3. Jose traz o resultado para revisão técnica do Claude — a revisão deve checar explicitamente: (a) nenhum produto/categoria inventado, (b) `SolutionCard`/`solutions-data.ts` reaproveitados sem duplicação, (c) modo compacto funcionando de fato em mobile e com `prefers-reduced-motion`, (d) ausência de scrollbar horizontal indesejada, (e) score de Lighthouse não regrediu abaixo de 0,90;
4. commit, merge e push continuam exclusivamente com o Jose.
