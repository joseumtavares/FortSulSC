# Proposta — Tarefa 3, Fatia 3: migrar `HeroSection`, `CategoryStrip` e `AboutSection` para Next.js

Status: APROVADA — AGUARDANDO IMPLEMENTAÇÃO (executor designado: Codex; nenhum código foi criado ou alterado por esta proposta)
Data: 28/08/2026 (revisão 2 — aprovada)
Escopo autorizado: Tarefa 3 (Incrementos 2–8, `tasks/plan.md`/`tasks/todo.md`), restrito nesta fatia ao Incremento 3 (Hero, tira de categorias e Sobre — interpretação confirmada por Jose)
Savepoint confirmado: commit `ecbd2f5` ("feat: migrar cabeçalho e rodapé responsivos (Tarefa 3.2)")

## 0.1 Decisões aprovadas e ajustes aplicados nesta revisão

Jose aprovou **D1 e D2** (diretórios `src/components/sections/` e `src/components/ui/`) sem ressalvas, e confirmou a interpretação de que "Hero, categorias e Sobre" é o próximo bloco da Tarefa 3 (Incremento 3). Ambos tratados como confirmados no restante deste documento.

Jose aprovou **D3 com ajuste obrigatório**: manter `next/image` com `fill` + `sizes="100vw"` para o `.hero-media`, mas (a) trocar `priority` por `preload` — nome correto da prop nesta versão do projeto (Next.js `^16.2.9`; `priority` está descontinuada em favor de `preload` a partir do Next.js 16, confirmado no Context7 nesta revisão) — e (b) corrigir os overrides responsivos de `background-position` (que não têm efeito sobre um elemento `<img>`/`next/image`, inclusive no CSS original do baseline, onde já eram inertes) para `object-position`, preservando `object-fit: cover`. A dimensão real do arquivo de origem foi verificada e é diferente do que o baseline declarava — ver seção 0.2.

Jose **não aprovou D4 como descrito** (uso de `fill` para `.about-image img`): o CSS do baseline escala essa imagem para `106%`/`112%` do contêiner via `width` em `%`, o que não compõe bem com `fill` (que já ocupa 100% do contêiner via `position: absolute; inset: 0`) e recriaria o tipo de aviso de dimensão que foi corrigido no logo (Fatia 2). Ajuste aplicado: `next/image` passa a usar as dimensões reais e verificadas do arquivo (`width`/`height` explícitos, sem `fill`), com `sizes` adequado, e o CSS do baseline (`width: 106%`/`112%`) é preservado como está, acrescido de `height: auto` para manter a proporção quando a largura é sobrescrita via CSS. Revertida a seção 3.4 e a nota de CSS correspondente na seção 4, detalhadas abaixo com a abordagem corrigida.

## 0.2 Verificação de dimensões reais das imagens (nova nesta revisão)

Sem ImageMagick/PIL/exiftool disponíveis no ambiente, as dimensões foram confirmadas por duas vias independentes — parsing manual do header VP8 do WebP e o utilitário `file` (libmagic), com resultado idêntico nas duas:

- `public/image/alimentador-reto-fundo-plantacao.webp` (hero, fonte de maior resolução do `srcset` do baseline): **1942×809px**. O baseline declara `width="1920" height="1280"` no `<img>` do hero — **essa declaração não corresponde ao arquivo real** (proporção declarada ≈1.5:1 vs. proporção real ≈2.4:1). Como o hero é renderizado com `object-fit: cover` dentro de um contêiner de altura fixa (`.hero`/`.hero-inner { min-height: ... }`, não a altura intrínseca da imagem), esse `width`/`height` do baseline nunca controlou o layout visível — servia só como reserva de espaço/hint de aspect-ratio para o navegador antes da Tarefa 2 existir, sem efeito visual perceptível. Com `next/image fill`, `width`/`height` não são usados (proibidos, na verdade — mutuamente exclusivos com `fill`, confirmado no Context7), então essa divergência do baseline deixa de ser relevante nesta migração; registrada aqui só para documentar a origem real do arquivo, como pedido.
- `public/image/alimentador-reto.webp` (about): **1448×1086px** — o baseline não declarava `width`/`height` para esta imagem; são usados agora pela primeira vez, com o valor real confirmado.

## 0.3 Nota de interpretação da fatia (confirmada por Jose)

`tasks/plan.md`/`tasks/todo.md` descrevem a Tarefa 3 por agrupamento de conteúdo ("SiteHeader/Footer; Hero/Categorias/Sobre; Soluções e filtros; Atendimento, Presença e CTA; e WhatsAppDialog"), sem numerar explicitamente cada fatia como "Incremento N". Fatia 2 já cobriu "SiteHeader/Footer" (Incremento 2, por ordem de aparição na lista). Jose confirmou que "Hero/Categorias/Sobre" é o próximo bloco da mesma lista (Incremento 3). Incremento 5 já está confirmado por nome em `docs/PLANEJAMENTO_PROJETO.md` (Soluções/filtros, ligado às cinco categorias oficiais) e Incremento 7 por `docs/PROMPT_CODEX_SECAO_NOVIDADES_E_DICAS.md` (Novidades e dicas) — nenhum dos dois é tocado nesta fatia.

## 0. Estado do repositório e fontes consultadas

`git status --short` no momento desta proposta:

```text
 M CLAUDE.md
 M docs/FortSulSC_instrucoes_Hermes_Codex.md
?? .agents/
?? .mcp.json
?? docs/CODEBASE_MAP.md
?? docs/Proposta_Tarefa_3_Fatia_2.md
?? skills-lock.json
```

Essas alterações são resíduo do setup de automação (subagentes/hooks/skills) já presente desde a fatia anterior — não pertencem a esta proposta e não foram tocadas. `docs/Proposta_Tarefa_3_Fatia_2.md` está untracked porque ainda não foi commitado por Jose junto com `ecbd2f5`; não é alterado aqui.

Documentos lidos antes de redigir esta proposta: `docs/PLANO_MESTRE_FORTSULSC.md`, `docs/PLANEJAMENTO_PROJETO.md` (categorias oficiais, resolução de conflitos), `docs/COMPONENTS.md` (§3.2 HeroSection, §3.3 CategoryStrip, §3.4 AboutSection), `docs/ARCHITECTURE.md` (árvore futura de `src/components/`), `docs/RULES.md`, `docs/CHECKLIST.md`, `docs/FortSulSC_instrucoes_Hermes_Codex.md`, `tasks/plan.md`, `tasks/todo.md`, além do baseline (`index.html` linhas 57–144, `styles.css` linhas 61–115 + 248–252 + trechos relevantes de 1050px/820px/560px, `script.js` linhas 51–93) e do código Next.js já commitado (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/components/layout/*`).

Skills aplicáveis declarados: `using-agent-skills` (fluxo), `incremental-implementation`/vertical slicing (Fatia 3 dentro da Tarefa 3), `test-driven-development` (contrato de testes descrito nesta proposta; código de teste só é escrito na implementação), `frontend-design`/design-system adherence.

Context7 consultado (`/vercel/next.js/v16.1.6`) para os pontos que fundamentam as decisões D3/D4 desta proposta (consulta refeita nesta revisão):

- `next/image` com `fill`: exige que o elemento pai tenha `position: relative` (ou `fixed`/`absolute`); a prop `sizes` deve ser informada sempre que `fill` for usado ou a imagem for responsiva via CSS — sem `sizes`, o navegador assume `100vw` e o Next gera um `srcset` limitado, adequado a imagem de tamanho fixo, não responsiva. Fonte: `docs/01-app/03-api-reference/02-components/image.mdx`.
- `width`/`height`: obrigatórios sempre que `fill` não for usado (a menos que a imagem seja importada estaticamente); definem o aspect-ratio intrínseco usado pelo navegador para reservar espaço e evitar layout shift — não controlam o tamanho renderizado, que continua sendo controlado por CSS. Confirma a abordagem de D4 (usar `width`/`height` reais em vez de `fill`, já que o enquadramento final é feito via CSS `width: 106%/112%`). Fonte: mesmo documento.
- `priority` está descontinuada a partir do Next.js 16 em favor de `preload` (prop booleana equivalente, insere `<link rel="preload">` no `<head>`; recomendada para o elemento LCP acima da dobra, caso do hero). Como o projeto usa `next@^16.2.9` (`package.json`), esta proposta usa `preload`, não `priority`. Fonte: mesmo documento.

## 1. Objetivo, escopo incluído e exclusões

**Objetivo:** migrar as três primeiras seções de conteúdo da home (`.hero`, `.category-strip`, `.about`) do baseline estático para componentes Next.js (`HeroSection`, `CategoryStrip`, `AboutSection`), preservando paridade visual e de conteúdo integral, e introduzir o primeiro Client Component compartilhado (`Reveal`) para o padrão de animação de entrada por scroll (`.reveal`/`.reveal-delay`) usado por essas três seções e por todas as seções futuras da home.

**Incluído nesta fatia:**

- `Reveal` (Client Component, `src/components/ui/`) — encapsula o `IntersectionObserver` hoje em `script.js` (linhas 77–90), reutilizável pelas fatias seguintes (Soluções, Atendimento, Presença, Novidades, CTA final).
- `HeroSection` (Server Component, `src/components/sections/`) — imagem de fundo, eyebrow, título, descrição, dois CTAs e o card "Do projeto ao pós-venda".
- `CategoryStrip` (Server Component, `src/components/sections/`) — as 5 categorias do baseline, na ordem e com os rótulos atuais.
- `AboutSection` (Server Component, `src/components/sections/`) — imagem, selo, eyebrow, título, texto, lista de 2 diferenciais e link final.
- `<main id="conteudo">` de `src/app/page.tsx` passa a renderizar as três seções acima, substituindo o placeholder de teste da Fatia 2.
- CSS de `.hero*`, `.category-*`, `.about*`, `.eyebrow*`, `.text-link*`, `.feature-*`, `.reveal*`, `.lead`, `.section` e os ajustes de `h1`/`h2` de tamanho, migrados de `styles.css` para `src/app/globals.css`.

**Explicitamente fora de escopo (não implementado nesta fatia):**

- `index.html`, `styles.css`, `script.js`, `image/` — preservados byte a byte, sem qualquer edição.
- Seções `.solutions`, `.support`, `.presence`, `.content-section` (Novidades e dicas), `.cta-section` — Incrementos 5–8, fora desta fatia. Nenhum CSS dessas seções é portado.
- Contrato de teste das cinco categorias oficiais para `SolutionFilterId` (`Aviário, Equipamentos, Fumageiro, Piscicultura, Secadores`) — pertence ao Incremento 5; `CategoryStrip` nesta fatia é conteúdo estático de âncora (`href="#solucoes"`), não um filtro, e não decide nem valida essas categorias.
- Página de produto, 404, API, banco de dados, Docker, admin, autenticação — fora de escopo do projeto nesta fase (CLAUDE.md §2/§13).
- Testes automatizados em código e implementação de componentes — só ocorrem após aprovação desta proposta.

## 2. Arquivos a serem criados ou modificados

| Arquivo | Ação | Motivo |
|---|---|---|
| `src/components/ui/Reveal.tsx` | criar | Client Component: aplica `.reveal`/`is-visible` via `IntersectionObserver`, replica `script.js` linhas 77–90 |
| `src/components/ui/Reveal.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/components/sections/HeroSection.tsx` | criar | Server Component: imagem de fundo, copy, CTAs, nota lateral |
| `src/components/sections/HeroSection.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/components/sections/CategoryStrip.tsx` | criar | Server Component: 5 âncoras de categoria |
| `src/components/sections/CategoryStrip.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/components/sections/AboutSection.tsx` | criar | Server Component: imagem, selo, copy, diferenciais, link |
| `src/components/sections/AboutSection.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/app/globals.css` | modificar | adicionar seção `/* ===== Fatia 3 — Hero, tira de categorias e Sobre ===== */` (ver seção 4) |
| `src/app/page.tsx` | modificar | substituir o placeholder de teste por `<HeroSection /><CategoryStrip /><AboutSection />` dentro do `<main id="conteudo">` já existente |
| `docs/COMPONENTS.md` | modificar | marcar `HeroSection`/`CategoryStrip`/`AboutSection`/`Reveal` como implementados, com props reais |
| `tasks/plan.md` / `tasks/todo.md` | modificar | marcar o bloco "Hero/Categorias/Sobre" como concluído, após aprovação e commit |

Nenhum arquivo do baseline estático (`index.html`, `styles.css`, `script.js`, `image/`) é criado, modificado ou removido.

## 3. Estrutura e responsabilidades

### 3.1 `Reveal` (Client Component, `src/components/ui/Reveal.tsx`)

Encapsula o padrão de animação de entrada usado em todo `script.js` (linhas 77–90: `IntersectionObserver` com `threshold: 0.12`, adiciona `is-visible` ao interceptar e desconecta o observer daquele elemento; fallback síncrono se `IntersectionObserver` não existir no ambiente). Como a media query `prefers-reduced-motion` em `globals.css` já força `.reveal { opacity: 1; transform: none }` incondicionalmente (migrado na Fatia 1), o componente não precisa de lógica própria de `matchMedia`.

API mínima, sem prop de configuração além do necessário para reaproveitar as duas variantes visuais já existentes no CSS:

```tsx
type RevealProps = {
  children: React.ReactNode
  delay?: boolean // aplica a classe .reveal-delay, equivalente ao baseline
  className?: string
}

export function Reveal({ children, delay, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(node)
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={['reveal', delay && 'reveal-delay', isVisible && 'is-visible', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
```

`Reveal` sempre renderiza um `<div>` wrapper — igual ao baseline, onde `.reveal` é aplicado diretamente ao elemento de bloco que já existia (`.hero-copy`, `.hero-note`, `.about-visual`, `.about-copy`), nunca a um elemento inline. Nesta fatia, `HeroSection` usa `<Reveal>` para `.hero-copy` e `<Reveal delay>` para `.hero-note`; `AboutSection` usa `<Reveal>` para `.about-visual` e `<Reveal delay>` para `.about-copy`. `CategoryStrip` não usa `.reveal` no baseline (confirmado por grep: nenhuma ocorrência em `.category-strip`) e continua sem ele aqui.

### 3.2 `HeroSection` (Server Component)

Renderiza, na ordem do baseline (`index.html` linhas 58–100):

```tsx
<section className="hero" aria-labelledby="hero-title">
  <Image
    className="hero-media"
    src="/image/alimentador-reto-fundo-plantacao.webp"
    alt=""
    fill
    sizes="100vw"
    preload
  />
  <div className="container hero-inner">
    <Reveal className="hero-copy">
      <span className="eyebrow eyebrow-light">Tecnologia feita para o campo</span>
      <h1 id="hero-title">Mais eficiência para quem faz a produção acontecer.</h1>
      <p>
        Equipamentos agrícolas desenvolvidos para simplificar processos, elevar a produtividade e
        acompanhar a rotina real do produtor.
      </p>
      <div className="hero-actions">
        <a className="button" href="#solucoes">
          Conheça as soluções
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <a className="text-link text-link-light" href="#empresa">
          Por que escolher a FortSul
          <span aria-hidden="true">↘</span>
        </a>
      </div>
    </Reveal>

    <Reveal delay className="hero-note">
      <span className="hero-note-icon">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7" /></svg>
      </span>
      <div>
        <strong>Do projeto ao pós-venda</strong>
        <span>Uma equipe próxima em todas as etapas.</span>
      </div>
    </Reveal>
  </div>
</section>
```

Todo o texto (eyebrow, título, descrição, rótulos dos CTAs, nota lateral) é copiado literalmente do baseline. Nenhuma prop é usada nesta fatia — mesmo padrão pragmático adotado em `SiteHeader`/`SiteFooter` na Fatia 2 (conteúdo fixo, sem CMS/backend disponível ainda), embora `docs/COMPONENTS.md` §3.2 documente props futuras (`eyebrow`/`title`/`description`/`primaryCta`/`secondaryCta`/`backgroundImage`) para uma fase posterior orientada a dados.

**Nota sobre `className="hero-copy"` no `Reveal`:** como `Reveal` sempre envolve o conteúdo num `<div>`, a classe visual do baseline (`hero-copy`, `hero-note`) é passada via `className` para preservar o seletor CSS existente (`.hero-copy`, `.hero-note`) sem precisar de nenhuma regra nova; `Reveal` adiciona apenas `reveal`/`reveal-delay`/`is-visible` ao mesmo elemento.

Ver decisão **D3** (seção 7) sobre a estratégia de imagem do `.hero-media`.

### 3.3 `CategoryStrip` (Server Component)

Conteúdo estático, sem prop nesta fatia (mesma justificativa da seção 3.2). Renderiza as 5 categorias na ordem exata do baseline (`index.html` linhas 102–110) — que é a ordem de exibição visual aprovada, distinta da ordem alfabética usada em `docs/PLANEJAMENTO_PROJETO.md` para a lista oficial de categorias do Incremento 5 (Aviário, Equipamentos, Fumageiro, Piscicultura, Secadores). As duas ordens não precisam coincidir: uma é conteúdo de vitrine (Fase 1, aprovado, preservado aqui), a outra é o contrato de dados de filtro (Fase 2/Incremento 5, ainda não implementado).

```tsx
const categories = [
  { number: '01', label: 'Aviário' },
  { number: '02', label: 'Secadores' },
  { number: '03', label: 'Fumageiro' },
  { number: '04', label: 'Piscicultura' },
  { number: '05', label: 'Equipamentos' },
]

export function CategoryStrip() {
  return (
    <section className="category-strip" aria-label="Áreas de atuação">
      <div className="container category-grid">
        {categories.map((category) => (
          <a key={category.number} href="#solucoes">
            <span>{category.number}</span>
            {category.label}
          </a>
        ))}
      </div>
    </section>
  )
}
```

### 3.4 `AboutSection` (Server Component)

Renderiza, na ordem do baseline (`index.html` linhas 112–144), com `id="empresa"` no `<section>` — o mesmo id para o qual o CTA secundário do Hero e o link `#empresa` do menu principal (já migrado na Fatia 2) apontam, agora resolvido pela primeira vez:

```tsx
<section className="section about" id="empresa">
  <div className="container about-grid">
    <Reveal className="about-visual">
      <div className="about-image">
        <Image
          src="/image/alimentador-reto.webp"
          alt="Alimentador FortSul em destaque"
          width={1448}
          height={1086}
          sizes="(max-width: 820px) 100vw, 48vw"
          loading="lazy"
        />
      </div>
      <div className="about-seal">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg>
        <span>Engenharia<br />que trabalha</span>
      </div>
    </Reveal>

    <Reveal delay className="about-copy">
      <span className="eyebrow">Sobre a FortSul</span>
      <h2>Tecnologia robusta.<br />Relações duradouras.</h2>
      <p className="lead">
        A FortSul une conhecimento de campo, fabricação responsável e atendimento próximo para
        criar equipamentos que fazem sentido na operação de cada cliente.
      </p>
      <div className="feature-list">
        <div>
          <span className="feature-icon">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6" /></svg>
          </span>
          <div>
            <strong>Produção própria</strong>
            <p>Controle e atenção em cada etapa de fabricação.</p>
          </div>
        </div>
        <div>
          <span className="feature-icon">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 12l3 3 5-6" /></svg>
          </span>
          <div>
            <strong>Solução completa</strong>
            <p>Instalação, suporte, assistência e pós-venda.</p>
          </div>
        </div>
      </div>
      <a className="text-link" href="#atendimento">
        Conheça nosso jeito de trabalhar <span aria-hidden="true">→</span>
      </a>
    </Reveal>
  </div>
</section>
```

`href="#atendimento"` continua apontando para uma seção ainda não criada (Incremento 6) — comportamento idêntico ao estado atual do menu (Fatia 2), sem regressão: o link simplesmente não rola para lugar nenhum até aquela fatia existir.

`width={1448} height={1086}` são as dimensões reais do arquivo, verificadas na seção 0.2. O enquadramento visual (escala para além do contêiner, criando a sobreposição com `.about-visual::before`/`.about-seal`) continua sendo feito pelo CSS existente `.about-image img { width: 106%; ... }` (ver seção 4), não pela prop `fill` — decisão **D4** (seção 7).

## 4. Estratégia de migração de CSS (vs. baseline)

CSS é adicionado como uma nova seção em `src/app/globals.css` (mesma convenção das seções `Base`, `Fatia 1 — WhatsApp` e `Fatia 2 — cabeçalho, menu e rodapé` já presentes), migrando **apenas** os seletores de `.hero*`, `.category-*`, `.about*` e as utilidades genéricas que essas três seções passam a usar pela primeira vez. Nada de `.solutions*`, `.support*`, `.presence*`, `.content-*`, `.cta-section`, `.product-*` ou `.not-found*` é portado nesta fatia.

**Portado verbatim (hero):** `.hero`, `.hero-media` (base, incluindo `object-fit: cover; object-position: 58% center`), `.hero::before`, `.hero::after`, `.hero-inner`, `.hero-copy`, `.hero-copy > p`, `.hero-actions`, `.hero-note`, `.hero-note-icon`, `.hero-note-icon svg`, `.hero-note strong, .hero-note span`, `.hero-note strong`, `.hero-note div > span`, e os overrides responsivos em 1050px (`.hero { min-height: 620px }`, `.hero-inner { min-height: 620px }`, `.hero-copy { width: 64% }`), 820px (`.hero, .hero-inner { min-height: 700px }`, `.hero::before` com gradiente alternativo, `.hero-copy { width: 80% }`, `.hero-note { right: auto; left: 0 }`) e 560px (`.hero, .hero-inner { min-height: 720px }`, `.hero-inner { align-items: flex-start; padding-top: 87px }`, `.hero::before` com gradiente alternativo, `.hero-copy { width: 100% }`, `.hero-copy > p { font-size: 16px; line-height: 1.65 }`, `.hero-actions` em coluna, `.hero-actions .button { width: 100% }`, `.hero-note { left: 16px; right: 16px; bottom: 25px; width: auto }`).

**Corrigido nesta revisão (D3 — aprovado por Jose):** os overrides responsivos `.hero-media { background-position: 58% center }` (820px) e `.hero-media { background-position: 56% center }` (560px) do baseline são portados como `.hero-media { object-position: 58% center }` e `.hero-media { object-position: 56% center }`, respectivamente. `background-position` nunca teve efeito sobre `.hero-media`, que sempre foi um elemento `<img>` (nunca uma imagem de fundo CSS) — era uma regra inerte já no baseline. Migrar para `object-position` corrige esse ponto morto e faz o reenquadramento do ponto focal da imagem funcionar de fato nesses dois breakpoints — uma pequena mudança de comportamento visual (não presente no baseline renderizado) que Jose determinou explicitamente nesta revisão, não uma correção espontânea.

**Portado verbatim (tira de categorias):** `.category-strip`, `.category-grid`, `.category-grid a`, `.category-grid a:first-child`, `.category-grid a:hover`, `.category-grid span`, e o override em 820px (`.category-grid { overflow-x: auto; grid-template-columns: repeat(5, minmax(155px, 1fr)); scrollbar-width: none }`, `.category-grid::-webkit-scrollbar { display: none }`, `.category-grid a { min-height: 75px }`).

**Portado verbatim (sobre):** `.about`, `.about-grid`, `.about-visual`, `.about-visual::before`, `.about-visual::after`, `.about-image`, `.about-image img` (base: `width: 106%; max-width: none; filter: drop-shadow(...)`), `.about-seal`, `.about-seal svg`, `.about-seal span`, `.about-copy h2`, `.feature-list`, `.feature-list > div`, `.feature-icon`, `.feature-icon svg`, `.feature-list strong`, `.feature-list p`, e os overrides em 820px (`.about-grid, .presence-grid { grid-template-columns: 1fr }` — só a parte de `.about-grid` é relevante aqui; `.presence-grid` ainda não existe nesta fatia, mas a regra combinada é copiada como está no baseline, sem efeito colateral, já que `.presence-grid` simplesmente não existirá no DOM até o Incremento 6; `.about-visual { min-height: 520px }`, `.about-copy { max-width: 610px }`) e 560px (`.about-visual { min-height: 370px }`, `.about-image img { width: 112%; ... }`, `.about-seal { width: 112px; bottom: -3px }`).

**Ajuste nesta revisão (D4 — aprovado por Jose):** `.about-image img { width: 106%; max-width: none; ... }` (base) e `.about-image img { width: 112%; ... }` (560px) recebem `height: auto` adicionado (`.about-image img { width: 106%; height: auto; max-width: none; filter: ... }` e o equivalente em 560px), já que `next/image` sem `fill` gera o atributo `height` a partir da prop `height={1086}` — sem `height: auto` no CSS, a sobrescrita de `width` via `%` distorceria a proporção da imagem. Nenhum outro valor do baseline muda.

**Utilidades genéricas usadas pela primeira vez nesta fatia (adicionadas junto, na seção "Fatia 3" de `globals.css`, não na "Base"):** `.eyebrow`, `.eyebrow::before`, `.eyebrow-light` (hero e about); `.text-link`, `.text-link span`, `.text-link:hover span`, `.text-link-light` (hero e about); `.lead` (about); `.section { padding-block: 115px }` e seu override em 820px (`.section { padding-block: 88px }`) — usado por `.about` e, futuramente, por `.solutions`/`.support`/`.presence`/`.content-section`/`.cta-section`; `.reveal`, `.reveal-delay`, `.reveal.is-visible` e a extensão da regra `prefers-reduced-motion` já existente (`.reveal { opacity: 1; transform: none }`, adicionada à declaração de `prefers-reduced-motion` já presente na seção `Base`, não uma nova media query); `h1 { max-width: 650px; font-size: clamp(48px, 5.3vw, 74px) }` e `h2 { font-size: clamp(38px, 4.3vw, 58px) }` (o reset `h1, h2, h3 { margin: 0; line-height: 1.08; letter-spacing: -.035em }` já está migrado desde a Fatia 1B/Base; faltam só os tamanhos), e os overrides de 560px `h1 { font-size: clamp(42px, 12.5vw, 58px) }`, `h2 { font-size: clamp(35px, 10vw, 46px) }`.

**Explicitamente não portado:** `.solutions*`, `.support*`, `.presence*`, `.content-*`, `.cta-section`, `.product-*`, `.not-found*`, `.section-heading`, `.content-heading`, `.footer-*` (já migrado na Fatia 2) — nenhuma dessas regras é tocada, mesmo quando aparecem no mesmo bloco `@media` do baseline que outras regras já listadas acima (ex.: o bloco de 820px do baseline mistura `.hero*`/`.category-*`/`.about-grid` com `.section-heading`/`.content-heading`/`.presence-grid`/`.map-wrap`; só as regras explicitamente listadas acima são portadas, as demais ficam de fora até suas respectivas fatias).

**Observação sobre `.hero-media` (D3):** ao usar `next/image fill`, `object-fit: cover` e `object-position` continuam sendo aplicados via CSS normal ao `<img>` gerado pelo Next (mesmo seletor `.hero-media` do baseline, incluindo os overrides de `object-position` corrigidos acima) — nenhuma prop `style` adicional é necessária além do CSS já migrado.

## 5. Contrato de testes proposto

Seguindo o padrão já usado nas fatias anteriores (Vitest + Testing Library, nomes em português). Código de teste será escrito durante a implementação (RED antes do GREEN); esta seção descreve o contrato a implementar.

**`Reveal.test.tsx`**
1. Sem `IntersectionObserver` mockado como "intersecting": renderiza os `children`, elemento wrapper com classe `reveal` e sem `is-visible`.
2. Com um mock de `IntersectionObserver` que invoca o callback com `isIntersecting: true`: o wrapper recebe `is-visible` após o efeito rodar.
3. Prop `delay`: adiciona `reveal-delay` ao wrapper.
4. Ambiente sem `IntersectionObserver` (`typeof IntersectionObserver === 'undefined'`, simulado removendo o global no teste): o wrapper recebe `is-visible` imediatamente, replicando o fallback do baseline.

**`HeroSection.test.tsx`**
1. Renderização básica: `<section aria-labelledby="hero-title">`, `<h1 id="hero-title">` com o texto do baseline, os dois CTAs (`getByRole('link', { name: /Conheça as soluções/ })` → `href="#solucoes"`; `getByRole('link', { name: /Por que escolher a FortSul/ })` → `href="#empresa"`), e o texto da nota lateral ("Do projeto ao pós-venda").
2. Imagem de fundo: `getByAltText('')` presente (decorativa, `alt=""` preservado do baseline) — não bloqueia leitores de tela.

**`CategoryStrip.test.tsx`**
1. Renderiza exatamente 5 links com `href="#solucoes"`, na ordem "01 Aviário, 02 Secadores, 03 Fumageiro, 04 Piscicultura, 05 Equipamentos".
2. `<section aria-label="Áreas de atuação">` presente.

**`AboutSection.test.tsx`**
1. `<section id="empresa">` presente (confirma que o alvo do CTA do Hero e do menu principal existe).
2. Título, texto principal, os 2 itens de `.feature-list` (título + descrição de cada) e o link final (`href="#atendimento"`) presentes com o texto do baseline.
3. Imagem: `getByAltText('Alimentador FortSul em destaque')` presente.

**Fora do contrato automatizado (jsdom não calcula layout real nem `IntersectionObserver` nativamente):** o comportamento visual do `object-position` responsivo do hero/about e a transição real de opacidade/transform do `Reveal` recebem apenas verificação de classe (`is-visible` presente/ausente), não de estilo computado; a validação visual é manual, no navegador (seção 6).

## 6. Validações automatizadas e manuais

**Automatizadas:**
- `npm run typecheck` — sem erro.
- `npm run test:unit` (Vitest) — os seis arquivos de teste da seção 5, mais as suítes já existentes (`whatsapp-flow.test.tsx`, `SiteHeader.test.tsx`, `SiteFooter.test.tsx`, `MobileMenu.test.tsx`) continuando verdes.
- `npm run build` — sem erro.
- `npm test` (suíte do preview estático) — verde, já que o baseline não é tocado.

**Manuais (Jose, antes da aprovação final):**
- Comparação visual lado a lado com `index.html` em três larguras: desktop, ~820px, ~560px/375px — hero (imagem de fundo, enquadramento, CTAs, nota lateral), tira de categorias (grade fixa vs. scroll horizontal em 820px), seção Sobre (imagem, selo, lista de diferenciais).
- Confirmar que a animação de entrada (`.reveal`) dispara ao rolar até cada seção, com o mesmo atraso relativo entre `.hero-copy`/`.hero-note` e `.about-visual`/`.about-copy` do baseline.
- Confirmar que os CTAs internos (`#solucoes`, `#empresa`, `#atendimento`) se comportam como no estado atual: `#empresa` agora rola até a seção Sobre (novo, resolvido nesta fatia); `#solucoes` e `#atendimento` continuam sem alvo até os Incrementos 5 e 6.
- `prefers-reduced-motion` ativo no SO/navegador: confirmar que a entrada das três seções aparece imediatamente, sem transição (mesma regra global já migrada na Fatia 1, agora testada pela primeira vez com conteúdo real usando `.reveal`).
- Lighthouse de acessibilidade/performance na home com as três seções (a imagem do hero é a maior da página — vale conferir LCP).

## 7. Riscos, decisões pendentes e proposta de commit atômico

**Decisões — todas aprovadas nesta revisão:**

- **D1 (aprovado):** novo diretório `src/components/sections/` para `HeroSection`, `CategoryStrip`, `AboutSection` (primeira vez que esse diretório é usado no projeto), conforme árvore futura documentada em `docs/ARCHITECTURE.md`.
- **D2 (aprovado):** novo diretório `src/components/ui/` para `Reveal` (primeira vez que esse diretório é usado), conforme `docs/COMPONENTS.md` linha 23.
- **D3 (aprovado com ajuste — imagem do hero, `.hero-media`):** `next/image` com `fill` + `sizes="100vw"` + `preload` (não `priority` — descontinuada no Next.js 16, ver seção 0), usando como fonte o arquivo `alimentador-reto-fundo-plantacao.webp` (dimensão real 1942×809px, verificada na seção 0.2) — o Next passa a gerar e otimizar suas próprias variantes responsivas em vez de servir os 3 arquivos pré-gerados na Tarefa 2. Isso muda o comportamento de rede (quais arquivos o navegador baixa), não o resultado visual; Jose aprovou essa mudança de técnica explicitamente. Os overrides responsivos de posicionamento passam de `background-position` (inerte no baseline) para `object-position` (seção 4) — ajuste determinado por Jose nesta revisão.
- **D4 (aprovado com ajuste — imagem do about, `.about-image img`):** revertida a proposta original de `fill`. `next/image` passa a usar `width={1448} height={1086}` (dimensão real, verificada na seção 0.2, sem `fill`) e `sizes="(max-width: 820px) 100vw, 48vw"`; o enquadramento visual continua controlado pelo CSS existente do baseline (`width: 106%/112%`), com `height: auto` adicionado (seção 4) para não distorcer a proporção. Evita o conflito entre `fill` (ocupa 100% do contêiner) e a escala `%` do baseline, e evita recriar o aviso de dimensão já corrigido no logo.

**Riscos:**
- **R1:** `Reveal` depende de `IntersectionObserver`, que não existe nativamente em jsdom — os testes descritos na seção 5 exigem mockar o global; se o mock não refletir fielmente a API real (assinatura do callback, `unobserve`), o teste pode passar sem garantir o comportamento real no navegador (mitigado pela validação manual da seção 6).
- **R2:** a mudança de `<img>` simples para `next/image` (hero com `fill`; about com `width`/`height` explícitos) introduz uma camada de otimização de imagem do Next (requer o pipeline de otimização ativo em build/runtime) para ambas — se o ambiente de deploy não suportar otimização de imagem (ex.: certos hosts estáticos), essas duas imagens podem falhar ou cair para não-otimizadas; ponto a confirmar antes da implementação, já que ainda não há decisão registrada sobre onde o projeto será hospedado.
- **R3:** o bloco `@media (max-width: 820px)` do baseline mistura seletores desta fatia (`.hero*`, `.category-grid`, `.about-grid`) com seletores de fatias futuras (`.section-heading`, `.presence-grid`, `.map-wrap`, `.content-heading`) na mesma regra `@media`; a migração seletiva (seção 4) reduz risco de path incorreto, mas exige atenção redobrada na implementação para não copiar o bloco inteiro por engano.

**Proposta de commit atômico** (só após testes, validação manual e aprovação dupla, conforme seção 6.2 do contrato operacional):

```text
feat: migrar Hero, tira de categorias e Sobre para Next.js (Tarefa 3 — Fatia 3)
```

Um único commit contendo todos os arquivos listados na seção 2, sem mistura com qualquer outra alteração pendente no repositório.

## 8. Bloco de status

```text
STATUS: APROVADA — AGUARDANDO IMPLEMENTAÇÃO (executor designado: Codex)

ALTERAÇÕES
- Nenhuma. Este documento é somente a proposta técnica; nenhum arquivo de
  código, CSS ou configuração foi criado ou modificado.

VALIDAÇÕES
- Não aplicável nesta etapa (proposta, sem implementação).

PENDÊNCIAS E RISCOS
- Decisões D1–D4 (seção 7): APROVADAS por Jose (D3 e D4 com ajustes aplicados
  nesta revisão — ver seção 0.1/0.2).
- Interpretação do incremento (seção 0.3): CONFIRMADA por Jose.
- Riscos R1, R2, R3 (seção 7) para acompanhamento durante e após a implementação.
- Implementação delegada a Codex — Codex deve seguir o contrato operacional
  (`docs/FortSulSC_instrucoes_Hermes_Codex.md`) e entregar no formato de saída
  ali definido (seção 10) para nova revisão do Claude antes de commit/push.

FORA DO ESCOPO
- Baseline estático, Incrementos 5–8 (Soluções/filtros, Atendimento, Presença,
  Novidades e dicas, CTA final), produto/404/API/banco/Docker/admin — ver seção 1.

DOCUMENTAÇÃO E SECOND BRAIN
- Decisão de aprovação (D1–D4 + interpretação do incremento) a registrar no
  Second Brain (30-Decisoes/) por quem executar o protocolo global antes/durante
  a implementação.
```
