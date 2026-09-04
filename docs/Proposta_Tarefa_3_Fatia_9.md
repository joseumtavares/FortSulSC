# Proposta técnica — Tarefa 3, Fatia 9 (componente "A FortSul" — fichário animado, `#empresa`)

Status: PROPOSTA REVISADA PELO `ui-reviewer` (01/09/2026) — AGUARDANDO APROVAÇÃO DE JOSE, incluindo uma decisão pendente sobre imagens (ver §7) (nenhum código foi criado ou alterado por esta proposta)
Data: 01/09/2026

## 0. Origem, estado do repositório e fontes consultadas

- Origem: item **A2** de `docs/Entrevista_Cliente_Fase3_Modelo_e_Regras.md` (linhas 29-286), aprovado por Jose em 01/09/2026 junto com o restante da Fase 3 ("aprovado, todas as alterações foram solicitadas e validadas por mim"). É escopo de **frontend/UI estrutural**, não de modelagem de dados — por isso ganha proposta própria, fora de `docs/Proposta_Tarefa_4_Fase3_Modelagem.md` e de `docs/Proposta_Tarefa_4_Fatia_4_1.md`.
- Commit mais recente na `main`: `4bf9275 merge: concluir Fase Docker`.
- A Tarefa 3 (migração da Home para React/Next.js) está 100% concluída (Fatias 1-8). Esta proposta é a **Fatia 9**: substitui o conteúdo da seção `#empresa` (hoje `AboutSection.tsx`) sem alterar o menu, a URL âncora ou a posição da seção na página.
- Lidos nesta sessão: `src/components/sections/AboutSection.tsx` e `AboutSection.test.tsx` (conteúdo/contrato atuais de `#empresa`), `src/components/ui/Reveal.tsx` (mecanismo de entrada por scroll, não reaproveitável para troca de aba), `src/components/solutions/SolutionFilters.tsx` (precedente de botões `aria-pressed`, deliberadamente **sem** semântica de tabs — documentado em `docs/Proposta_Tarefa_3_Fatia_4.md`), `src/app/globals.css` (tokens de cor/raio/sombra, breakpoints `1050px`/`820px`/`560px`, bloco `prefers-reduced-motion` atual, `.category-grid` como precedente de grade responsiva sem rolagem horizontal).
- Relatório de um agente de exploração (leitura ampla do repositório) confirmou adicionalmente: não há biblioteca de animação, carrossel ou componentes de UI instalada em `package.json` (sem Framer Motion, GSAP, Swiper, Embla, Radix, shadcn) — tudo hoje é CSS puro + React; `docs/DESIGN-SYSTEM.md`/`docs/COMPONENTS.md` não cobrem tabs/fichário; o link "A FortSul" em `SiteHeader.tsx` já aponta para `#empresa` e não precisa mudar.

## 1. Escopo incluído e exclusões

Incluído:
- Substituir o conteúdo de `AboutSection.tsx` (seção `id="empresa"`) por um componente de abas ("fichário") com as 6 abas e o texto exato do item A2 da entrevista: Fortsul, Nossa História, Missão, Visão, Valores, Sustentabilidade.
- Novo arquivo de dados `src/components/about/about-tabs-data.ts` com o conteúdo literal das 6 abas (título, texto, frase de destaque; Valores com 7 blocos ícone+texto).
- Novo Client Component `AboutTabs` (estado da aba ativa) + Server Component `AboutSection` (wrapper da seção, sem estado).
- CSS novo em `src/app/globals.css` (nova seção comentada, seguindo o padrão das fatias anteriores), incluindo tratamento de `prefers-reduced-motion` dedicado.
- Contrato de teste Vitest + Testing Library para `AboutTabs`, substituindo `AboutSection.test.tsx` (o teste atual fixa texto/estrutura do baseline antigo, que deixa de existir).
- Atualização de `docs/COMPONENTS.md`/`docs/DESIGN-SYSTEM.md` documentando o novo componente e o padrão de tabs (primeira ocorrência no projeto).

Excluído (fora desta fatia):
- Qualquer alteração em `SiteHeader.tsx` (o link `#empresa` já existe e não muda).
- Qualquer dado dinâmico, CMS, upload de imagem real ou personalização por administrador — conteúdo é estático, igual às demais seções da Home.
- Registro de interesse/analytics (item A5 da entrevista) — mecanismo ainda não definido, tratado à parte.
- Adição de biblioteca de animação/carrossel — a proposta usa apenas CSS + React, conforme "evitar dependências desnecessárias" (`CLAUDE.md` §6).

## 2. Por que precisa de Client Component (diferente do resto da Tarefa 3)

Ao contrário das demais seções da Home (estáticas, sem estado), o fichário precisa de estado de aba ativa, handlers de clique/teclado e classes CSS que mudam em tempo real. `AboutTabs` é `'use client'`. A seção em volta (`AboutSection`) permanece Server Component — só passa os dados estáticos de `about-tabs-data.ts` como children/props, seguindo a regra "componente visual recebe dados prontos" (`CLAUDE.md` §8).

## 3. Decisão de acessibilidade: usar semântica real de tabs (`role="tablist"`)

`SolutionFilters` usa botões simples com `aria-pressed`, **sem** `role="tablist"/"tab"`, porque os filtros são combináveis e não escondem conteúdo de forma mutuamente exclusiva (decisão documentada em `docs/Proposta_Tarefa_3_Fatia_4.md`). O fichário é o caso oposto: **exatamente um painel visível por vez**, conteúdo mutuamente exclusivo — o caso de uso canônico do padrão ARIA APG "Tabs". Por isso esta proposta usa:

- `role="tablist"` no contêiner das abas, com `aria-label="Seções sobre a FortSul"`.
- Cada aba: `role="tab"`, `id="tab-{slug}"`, `aria-selected`, `aria-controls="panel-{slug}"`, `tabIndex={isActive ? 0 : -1}` (roving tabindex).
- Cada painel: `role="tabpanel"`, `id="panel-{slug}"`, `aria-labelledby="tab-{slug}"`, `tabIndex={0}`.
- Navegação por teclado: `ArrowRight`/`ArrowLeft` movem foco e ativam a aba seguinte/anterior (ativação automática, padrão APG), `Home`/`End` vão para a primeira/última aba. Clique do mouse ativa diretamente.

Isso é uma escolha técnica desta fatia, não uma cópia do padrão de `SolutionFilters` — os dois componentes têm semânticas diferentes por bons motivos.

## 4. Estrutura de arquivos e responsabilidades

### 4.1 `src/components/about/about-tabs-data.ts` (novo)

```ts
export type AboutTabId = 'fortsul' | 'historia' | 'missao' | 'visao' | 'valores' | 'sustentabilidade'

export type AboutValueItem = { title: string; text: string }

export type AboutTab = {
  id: AboutTabId
  navLabel: string
  eyebrow: string
  title: string
  paragraphs: string[]
  highlight: string
  values?: AboutValueItem[]
}

export const aboutTabs: AboutTab[] = [
  {
    id: 'fortsul',
    navLabel: 'FortSul',
    eyebrow: 'Sobre a FortSul',
    title: 'Mais de 15 anos levando tecnologia, eficiência e praticidade ao homem do campo.',
    paragraphs: [
      'A FortSul SC é uma indústria especializada no desenvolvimento e fabricação de máquinas, equipamentos e soluções para o setor agrícola.',
      'Há mais de 15 anos, trabalhamos para transformar os desafios do campo em soluções mais eficientes, produtivas e acessíveis, contribuindo diretamente para a evolução do agronegócio brasileiro.',
      'Nossa história é construída ao lado do produtor rural, entendendo as necessidades de cada atividade e desenvolvendo equipamentos que unem tecnologia, resistência, qualidade e praticidade.',
      'Mais do que fabricar máquinas, buscamos oferecer soluções que ajudam o produtor a otimizar seu trabalho, reduzir custos e aumentar a eficiência de suas atividades.',
    ],
    highlight: 'FortSul: tecnologia e força para quem move o campo.',
  },
  {
    id: 'historia',
    navLabel: 'Nossa História',
    eyebrow: 'Nossa história',
    title: 'Uma história construída com trabalho, inovação e compromisso com o campo.',
    paragraphs: [
      'A FortSul SC nasceu com o propósito de desenvolver equipamentos capazes de facilitar o trabalho no campo e acompanhar a evolução do agronegócio brasileiro.',
      'Localizada às margens da SC-108, na cidade de Orleans, Santa Catarina, a empresa consolidou sua trajetória através do desenvolvimento de produtos de alta qualidade, tecnologia e excelente custo-benefício.',
      'Ao longo dos anos, ampliamos nossa atuação e conquistamos espaço no mercado agrícola, levando nossas soluções para diferentes regiões do Brasil, com forte presença especialmente na Região Sul.',
      'Nossa evolução é resultado da busca constante por inovação, melhoria de processos e, principalmente, da confiança construída junto aos nossos clientes, parceiros e fornecedores.',
      'Hoje, seguimos olhando para o futuro, investindo em tecnologia e desenvolvendo equipamentos preparados para atender às novas demandas do campo.',
    ],
    highlight: 'Nossa história começou no Sul do Brasil e continua crescendo ao lado do agronegócio brasileiro.',
  },
  {
    id: 'missao',
    navLabel: 'Missão',
    eyebrow: 'Nossa missão',
    title: 'Nossa Missão',
    paragraphs: [
      'Desenvolver e fornecer máquinas e equipamentos agrícolas que atendam às necessidades do produtor rural com qualidade, eficiência, tecnologia e confiabilidade.',
      'Buscamos superar as expectativas dos nossos clientes por meio de soluções que proporcionem maior produtividade, praticidade e segurança para as atividades realizadas no campo.',
      'Nosso compromisso é transformar conhecimento, experiência e inovação em equipamentos que contribuam para um agronegócio cada vez mais forte e eficiente.',
    ],
    highlight: 'Qualidade + Tecnologia + Eficiência + Confiança',
  },
  {
    id: 'visao',
    navLabel: 'Visão',
    eyebrow: 'Nossa visão',
    title: 'Nossa Visão',
    paragraphs: [
      'Ser reconhecida como uma empresa de referência no desenvolvimento de máquinas e equipamentos para o setor agrícola, destacando-se pela qualidade dos produtos, inovação e excelência no relacionamento com os clientes.',
      'Nossa visão é contribuir para um agronegócio mais eficiente, moderno e sustentável, oferecendo soluções capazes de reduzir custos, otimizar processos e melhorar o desempenho das atividades agrícolas.',
      'Queremos continuar crescendo junto com nossos clientes, acompanhando as transformações do mercado e investindo constantemente em novas tecnologias.',
    ],
    highlight: 'Evoluir constantemente para ajudar o campo a produzir cada vez melhor.',
  },
  {
    id: 'valores',
    navLabel: 'Valores',
    eyebrow: 'Nossos valores',
    title: 'Nossos Valores',
    paragraphs: [],
    highlight: '',
    values: [
      { title: 'Ética e Transparência', text: 'Construímos relações baseadas na confiança, honestidade e responsabilidade.' },
      { title: 'Trabalho em Equipe', text: 'Acreditamos que grandes resultados são construídos através da colaboração entre pessoas.' },
      { title: 'Respeito', text: 'Valorizamos as pessoas, as diferenças e todos aqueles que fazem parte da nossa história.' },
      { title: 'Inovação', text: 'Buscamos constantemente novas tecnologias e soluções para acompanhar a evolução do agronegócio.' },
      { title: 'Relacionamento', text: 'Mantemos relações sólidas e duradouras com clientes, fornecedores e parceiros.' },
      { title: 'Qualidade', text: 'Trabalhamos para garantir excelência em cada processo, produto e serviço oferecido.' },
      { title: 'Desenvolvimento Sustentável', text: 'Buscamos crescer de forma responsável, contribuindo para um futuro mais eficiente e sustentável.' },
    ],
  },
  {
    id: 'sustentabilidade',
    navLabel: 'Sustentabilidade',
    eyebrow: 'Sustentabilidade',
    title: 'Tecnologia para produzir hoje e construir o futuro.',
    paragraphs: [
      'Acreditamos que inovação e desenvolvimento devem caminhar junto com a responsabilidade.',
      'Por isso, buscamos desenvolver equipamentos que contribuam para uma operação agrícola mais eficiente, reduzindo desperdícios, otimizando processos e aproveitando melhor os recursos disponíveis.',
      'Nosso compromisso com o desenvolvimento sustentável está presente na busca constante por: maior eficiência operacional, melhor aproveitamento dos recursos, redução de desperdícios, equipamentos mais duráveis e soluções que contribuam para a produtividade do campo.',
    ],
    highlight: 'Desenvolver o presente com responsabilidade para fortalecer o futuro do agronegócio.',
  },
]
```

Nota: os 4 itens em lista (eficiência operacional, aproveitamento de recursos etc.) da aba Sustentabilidade foram condensados em um parágrafo para manter a mesma forma (`paragraphs: string[]`) das demais abas; se Jose preferir mantê-los como lista visual própria, é um ajuste de conteúdo (não estrutural) a fazer durante a implementação.

### 4.2 `src/components/about/AboutTabs.tsx` (novo, Client)

Responsabilidades: estado da aba ativa (`useState<AboutTabId>`), navegação por teclado (roving tabindex), controle da transição (aba anterior x aba nova) e renderização dos painéis.

Correções desta seção após revisão do `ui-reviewer`:
1. O código anterior usava `onAnimationEnd`, que só dispara para CSS **Animations** (`@keyframes`), nunca para CSS **Transitions** — como o CSS proposto em §5 usa `transition`, o painel que estava saindo nunca seria desmontado. Corrigido para `onTransitionEnd`, com uma trava (`event.target === event.currentTarget`) para não reagir a transições de elementos filhos.
2. Enquanto o painel `is-leaving` ainda está montado (até a transição terminar), ele recebia `tabIndex={0}` e nenhum `aria-hidden`, ficando focável e legível por leitor de tela ao mesmo tempo que o painel ativo. Corrigido: painel `is-leaving` recebe `aria-hidden="true"` e `tabIndex={-1}` explicitamente enquanto dura a transição.
3. `AboutTabs` agora recebe `tabs: AboutTab[]` como prop (ver §4.3), em vez de importar `aboutTabs` diretamente.

```tsx
'use client'

import { useRef, useState } from 'react'
import type { AboutTab, AboutTabId } from './about-tabs-data'

export function AboutTabs({ tabs }: { tabs: AboutTab[] }) {
  const [activeId, setActiveId] = useState<AboutTabId>(tabs[0].id)
  const [previousId, setPreviousId] = useState<AboutTabId | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  function activate(id: AboutTabId) {
    if (id === activeId) return
    setPreviousId(activeId)
    setActiveId(id)
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const lastIndex = tabs.length - 1
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
    if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = lastIndex
    if (nextIndex === null) return
    event.preventDefault()
    const nextTab = tabs[nextIndex]
    activate(nextTab.id)
    tabRefs.current[nextTab.id]?.focus()
  }

  return (
    <>
      <div className="about-tablist" role="tablist" aria-label="Seções sobre a FortSul">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              ref={(node) => { tabRefs.current[tab.id] = node }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`about-tab${isActive ? ' active' : ''}`}
              onClick={() => activate(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.navLabel}
            </button>
          )
        })}
      </div>

      <div className="about-panels">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          const isLeaving = tab.id === previousId
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              hidden={!isActive && !isLeaving}
              className={`about-panel${isActive ? ' is-active' : ''}${isLeaving ? ' is-leaving' : ''}`}
              onTransitionEnd={(event) => {
                if (isLeaving && event.target === event.currentTarget) setPreviousId(null)
              }}
            >
              <span className="about-panel-eyebrow">{tab.eyebrow}</span>
              <h3>{tab.title}</h3>
              {tab.values ? (
                <div className="about-values-grid">
                  {tab.values.map((value) => (
                    <div key={value.title} className="about-value-item">
                      <strong>{value.title}</strong>
                      <p>{value.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                tab.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              )}
              {tab.highlight && <p className="about-panel-highlight">{tab.highlight}</p>}
            </div>
          )
        })}
      </div>
    </>
  )
}
```

Nota de implementação (deixada para o Codex refinar em código, não em decisão de escopo): os dois painéis (`is-active` entrando, `is-leaving` saindo) ficam **ambos montados por até 600ms** durante a troca, com `position: absolute` no painel `is-leaving` para permitir a sobreposição sem "empurrar" o layout — o painel `is-active` define a altura do contêiner. `onTransitionEnd` desmonta o painel anterior (`hidden`) ao fim da transição, evitando manter os 6 painéis sempre no DOM (diferente do padrão `is-hidden` de `SolutionsGrid`, que faz sentido para filtros combináveis mas aqui geraria HTML e leitura de tela desnecessários para conteúdo 100% mutuamente exclusivo). Enquanto a transição dura, o painel `is-leaving` fica marcado `aria-hidden`/`tabIndex={-1}` para não ser exposto a leitor de tela nem alcançável por Tab.

### 4.3 `src/components/sections/AboutSection.tsx` (reescrito, Server)

Corrigido após revisão do `ui-reviewer`: o padrão real já usado no projeto para "dado estático + Client Component" é o Server Component importar os dados e repassá-los como prop (ver `SolutionsSection.tsx`, que importa `solutions`/`solutionFilters` e repassa para `SolutionsGrid`), não o Client Component importar o módulo de dados diretamente. `AboutSection` passa a importar `aboutTabs` e repassar via prop:

```tsx
import { AboutTabs } from '@/components/about/AboutTabs'
import { aboutTabs } from '@/components/about/about-tabs-data'

export function AboutSection() {
  return (
    <section className="section about" id="empresa" aria-labelledby="about-title">
      <div className="container about-fichario">
        <div className="about-fichario-header">
          <span className="eyebrow">A FortSul</span>
          <h2 id="about-title">Quem somos, de onde viemos e para onde vamos.</h2>
        </div>
        <AboutTabs tabs={aboutTabs} />
      </div>
    </section>
  )
}
```

`AboutTabs` (§4.2) passa a receber `tabs: AboutTab[]` como prop em vez de importar `aboutTabs` do módulo de dados diretamente.

`about-title` é um título fixo de seção (fora do fichário); o `<h3>` de cada painel (dentro de `AboutTabs`) carrega o título específico da aba ativa.

## 5. CSS — estratégia de animação e efeito "fichário"

Nova seção em `globals.css`, comentada como as demais fatias (`/* ===== Fatia 9 — A FortSul (fichário de abas, #empresa) ===== */`), usando os tokens existentes (`--blue-950`, `--orange`, `--ink`, `--muted`, `--surface`, `--white`, `--line`, `--radius`, `--shadow`) — sem cor nova.

Pontos centrais:
- **Barra de abas** (`.about-tablist`): fundo `--surface`, aba ativa com fundo `--white`, borda superior de destaque em `--orange` e leve elevação (`box-shadow` sutil) para simular a aba "puxada para frente" do fichário físico — replica o vocabulário visual do `.category-grid` (divisores finos entre itens) em vez de inventar um padrão novo.
- **Hover**: pequena elevação (`transform: translateY(-2px)`), sombra suave, transição de cor. Correção após revisão do `ui-reviewer`: `.filter-button:hover` (`globals.css:138`) **não** usa `transform`/elevação, só troca `border-color`/`background`/`color` — o precedente real de elevação com `translateY` no projeto é `.solution-card:hover { transform: translateY(-7px); }` (`globals.css:141`). O hover das abas segue esse precedente (elevação real), não o de `.filter-button`.
- **Transição de conteúdo** (`.about-panel`): `opacity` + `transform: translateY(...)` + leve `scale`, com `transition: opacity .45s ease, transform .45s ease` (dentro da janela 300-600ms pedida). O painel `is-leaving` usa a mesma transição invertida com `z-index` inferior, criando a sobreposição de camadas pedida sem exigir `position: absolute` fora do fluxo normal do documento em telas muito pequenas (ver §6).
- **`prefers-reduced-motion`**: o bloco já existente em `globals.css` (linha 215) ganha uma regra adicional `.about-panel { transition: none; transform: none; }` e a troca de aba passa a ser instantânea (sem overlap), consistente com o tratamento já dado a `.reveal`.
- **CSS antigo removido, não apenas CSS novo adicionado**: confirmado por busca no repositório que `.about-grid`, `.about-visual`, `.about-visual::before`, `.about-image`, `.about-seal`, `.feature-list`, `.feature-icon` e `.lead` (`globals.css:110-124` e as ocorrências correspondentes nos breakpoints `820px`/`560px`) são usadas **somente** por `AboutSection.tsx` hoje. Esta fatia remove essas regras (e as linhas de breakpoint associadas) no mesmo PR em que adiciona o CSS do fichário, para não deixar CSS morto no repositório.

## 6. Responsividade

Desktop/tablet (>820px): abas em linha horizontal no topo do fichário, como no baseline visual de referência do cliente.

Mobile (≤560px): em vez de rolagem horizontal com "scrollbar escondida" — padrão que já causou um bug de responsividade real no `.category-grid` (documentado no histórico do projeto) — esta proposta reaproveita a solução já validada: **grade CSS** (`grid-template-columns: repeat(2, minmax(0, 1fr))` ou `repeat(3, ...)` conforme testes de largura), com as 6 abas organizadas em 2-3 colunas, sem rolagem. Isso atende ao pedido do cliente ("nunca deixar o conteúdo apertado ou difícil de navegar") com um padrão que o projeto já sabe que funciona, em vez de reintroduzir um padrão já problemático.

Breakpoints reaproveitados: `820px` (ajuste de padding/tipografia do painel) e `560px` (grade de 2 colunas nas abas, título do painel reduzido).

## 7. Migração e testes

- `AboutSection.test.tsx` atual (fixa "Tecnologia robusta", "Produção própria", `Alimentador FortSul em destaque` etc.) **é substituído**, não estendido — esse conteúdo deixa de existir em `#empresa`.
- **⚠️ Pergunta aberta para Jose (achado do `ui-reviewer`, corrige uma suposição errada de uma versão anterior deste documento):** confirmado por busca no repositório que `alimentador-reto.webp` e `selo_qualidade_fortsul.webp` são usados **somente** dentro de `AboutSection.tsx` hoje — nenhuma outra seção já migrada reaproveita essas duas imagens (as parecidas em outras seções, como `alimentador-reto-banner1.webp`, são arquivos diferentes). Ou seja, substituir `AboutSection.tsx` pelo fichário **remove completamente o selo de qualidade e essa foto do alimentador do site**, já que a entrevista do cliente (item A2) especifica apenas conteúdo textual para as 6 abas, sem prever onde essas duas imagens ficariam. Antes de aprovar esta fatia, Jose precisa decidir: (a) remover as duas imagens do site (aceitável, já que não é dado sensível nem elemento obrigatório), (b) reposicionar o selo de qualidade em outra seção da Home (ex.: `SupportSection`/rodapé), ou (c) incluir uma das imagens dentro de uma das abas do fichário (ex.: aba "Fortsul" ou "Nossa História"). Esta proposta não assume nenhuma das três — fica pendente de resposta.
- Novo `src/components/about/AboutTabs.test.tsx`, no espírito de `SolutionFilters.test.tsx`/`SolutionsGrid.test.tsx`:
  - renderiza 6 `role="tab"` com os `navLabel` corretos, na ordem de `about-tabs-data.ts`;
  - a primeira aba (`fortsul`) inicia com `aria-selected="true"` e seu painel correspondente visível;
  - clicar em uma aba muda `aria-selected` e exibe o `role="tabpanel"` correspondente (`getByRole('tabpanel', { name: ... })` via `aria-labelledby`);
  - `ArrowRight`/`ArrowLeft`/`Home`/`End` movem o foco e ativam a aba esperada;
  - a aba "Valores" renderiza os 7 blocos (`about-value-item`) em vez de parágrafos.
- Novo `AboutSection.test.tsx` mínimo: confirma `id="empresa"`, `role="region"`, a presença do `role="tablist"` e que a primeira aba (`fortsul`) já renderiza com `aria-selected="true"` e seu painel visível por padrão (evita regressão de estado inicial).

## 8. Documentação a atualizar

- `docs/COMPONENTS.md`: nova entrada para `AboutTabs`/`AboutSection` (substitui a descrição atual do About), documentando o padrão de tabs pela primeira vez no projeto.
- `docs/DESIGN-SYSTEM.md`: registrar o padrão visual do "fichário" (abas com destaque de aba ativa, transição de painel) como novo token de interação reutilizável, caso surjam casos futuros semelhantes.

## 8.1 Notas de acessibilidade adicionais (revisão do `ui-reviewer`)

- Navegação por teclado usa apenas `ArrowLeft`/`ArrowRight`/`Home`/`End` (orientação horizontal do APG), mesmo quando o layout mobile vira grade 2-3 colunas — isso é intencional (navegação segue a ordem de leitura das abas, não a posição visual em grade) e fica registrado aqui para não ser confundido com lacuna de implementação.
- Nenhum `outline: none` global existe hoje em `globals.css`, então o anel de foco padrão do navegador já funcionaria em `.about-tab`/`.about-panel` sem CSS adicional — a implementação não deve suprimir esse foco visível ao estilizar hover/estado ativo.

## 9. Riscos e limites

- Sem dado sensível, sem backend, sem regra de negócio — conteúdo 100% estático, igual às demais seções da Home.
- O efeito de "profundidade/sobreposição" pedido pelo cliente é resolvido com CSS puro (sem lib nova); se durante a implementação o resultado visual ficar aquém do esperado, a alternativa mais simples é reduzir a sobreposição para um crossfade mais direto — decisão de ajuste fino de CSS, não de escopo.
- `AboutSection.test.tsx` atual será removido/substituído — não há branch de app em produção dependendo do conteúdo antigo, pois a Home já está atrás do fluxo de revisão de Jose antes de qualquer merge.

## 10. Status e próximos passos

Revisão do subagente `ui-reviewer` concluída em 01/09/2026 (conforme `CLAUDE.md` §3.1 item 7). Achados aplicados nesta versão do documento:
- corrigido o bug `onAnimationEnd`→`onTransitionEnd` que impedia o painel anterior de ser desmontado (§4.2);
- adicionado `aria-hidden`/`tabIndex={-1}` no painel `is-leaving` durante a transição, evitando foco/leitura duplicados (§4.2);
- `AboutTabs` passa a receber `tabs` como prop (Server → Client), alinhado ao precedente real de `SolutionsSection`/`SolutionsGrid` (§4.1/4.3);
- corrigida a citação de precedente de hover, de `.filter-button` para `.solution-card:hover` (§5);
- registrada a remoção do CSS órfão de `AboutSection` (`.about-grid`, `.about-visual`, `.feature-list` etc.) como parte explícita desta fatia (§5);
- documentada como pendente a decisão sobre o destino das imagens `alimentador-reto.webp`/`selo_qualidade_fortsul.webp`, hoje exclusivas de `AboutSection.tsx` (§7).

Próximos passos:
1. **Aprovação de Jose**, incluindo a decisão pendente do §7 (destino das duas imagens).
2. Implementação pelo Codex em branch/worktree própria (nunca commit/push direto do agente).
3. Revisão do Claude sobre o resultado implementado, antes do merge por Jose.

Este documento não altera nenhum arquivo de código-fonte; é somente a proposta técnica solicitada por Jose ("precisa de proposta técnica").
