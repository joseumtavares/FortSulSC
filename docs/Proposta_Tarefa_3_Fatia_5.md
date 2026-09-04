# Proposta técnica — Tarefa 3, Fatia 5 (Atendimento)

Status: PROPOSTA — AGUARDANDO APROVAÇÃO DE JOSE (nenhum código foi criado ou alterado por esta proposta)
Data: 29/08/2026

## 0. Estado do repositório e fontes consultadas

- Commit mais recente: `63f709c feat: implementar SolutionsSection com filtro de categorias (Tarefa 3.4)`.
- `git status --short` confirma árvore limpa quanto aos arquivos desta fatia (mudanças pendentes existentes — `CLAUDE.md`, `docs/FortSulSC_instrucoes_Hermes_Codex.md`, tooling — são pré-existentes e não pertencem a esta proposta).
- Lidos nesta sessão: `index.html` (linhas 210-224), `styles.css` (linhas 141-153, 265-266, 306-308, 331-345), `docs/COMPONENTS.md` (§3.7 SupportSection, §3.8 SupportStep), `docs/PLANEJAMENTO_PROJETO.md` (verificação de que a seção Atendimento está dentro do escopo Fase 2 já autorizado para a Home, sem numeração formal de "Incremento" própria — segue a mesma autorização geral das Fatias 2-4).
- `next: ^16.2.9` inalterado (confirmado nas fatias anteriores).

## 0.1 Mapeamento desta fatia

"Fatia 5" (nomenclatura de Jose) = seção `#atendimento` do baseline (`section.support`), a quarta seção da Home após Hero, CategoryStrip/Sobre e Soluções.

## 1. Objetivo, escopo incluído e exclusões

Objetivo: migrar a seção "Atendimento completo" (heading + 4 etapas do processo de atendimento) do HTML/CSS estático para React/Next.js, preservando exatamente o layout, texto e comportamento aprovados.

Incluído:
- `SupportSection` (Server Component) — heading da seção (`support-heading`) e grid de etapas (`support-steps`).
- `SupportStep` (Server Component, presentational) — uma etapa individual (número, ícone, título, descrição).
- Dados das 4 etapas em `src/components/support/support-data.ts`.
- Migração das regras CSS correspondentes (`.support*`, `.step-icon*`) para `src/app/globals.css`.
- Composição em `src/app/page.tsx` (`<SupportSection />` após `<SolutionsSection />`).

Excluído (fora desta fatia):
- Seção "Presença" (`#presenca`, mapa/Leaflet) — depende de decisão futura sobre dados de localização (ver regras de segurança do CLAUDE.md §14 — coordenadas de representante pessoa física devem ser aproximadas).
- Seção CTA final (`.cta-section`) e rodapé — já tratados ou fora de escopo.
- Qualquer backend, banco de dados ou regra de negócio.

## 2. Por que não precisa de Client Component

Diferente da Fatia 4, esta seção não tem estado, filtro ou interatividade — é conteúdo estático com animação `Reveal` (já um Client Component compartilhado). `SupportSection` e `SupportStep` permanecem 100% Server Components, apenas consumindo `Reveal` para a animação de entrada, no mesmo padrão já usado em `AboutSection`/`SolutionsSection`.

## 3. Estrutura e responsabilidades

### 3.1 `src/components/support/support-data.ts`

```ts
export type SupportStep = {
  number: string
  title: string
  description: string
  icon: string // path "d" do SVG, mesmo desenho do baseline
}

export const supportSteps: SupportStep[] = [
  {
    number: '01',
    title: 'Entendimento',
    description: 'Conhecemos a necessidade e o contexto da sua produção.',
    icon: 'M4 19h16M7 16l3-3 3 2 5-6',
  },
  {
    number: '02',
    title: 'Instalação',
    description: 'Técnicos especializados preparam o equipamento na propriedade.',
    icon: 'M4 20h16M7 17V8h10v9M9 8V4h6v4',
  },
  {
    number: '03',
    title: 'Suporte',
    description: 'Orientação ágil para as necessidades do dia a dia.',
    icon: 'M5 12a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2h-2v-6h4M5 13h4v6H7a2 2 0 0 1-2-2v-5Z',
  },
  {
    number: '04',
    title: 'Pós-venda',
    description: 'Acompanhamento para manter o desempenho do equipamento.',
    icon: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3',
  },
]
```

Copy e paths de ícone copiados literalmente de `index.html` linhas 219-222 (D-equivalente a D7 das fatias anteriores: manter copy exata do baseline).

### 3.2 `SupportSection` (Server)

Renderiza `<section className="section support" id="atendimento" aria-labelledby="support-title">`, container, heading (`support-heading`, com `eyebrow`/`h2`/`p`, envolvido em `Reveal`) e `<div className="support-steps">` mapeando `supportSteps` para `SupportStep`, aplicando `delay` nas etapas de índice ímpar (1 e 3 → "02" e "04"), replicando exatamente as classes `reveal`/`reveal-delay` do baseline (`article.reveal` nas etapas 01/03, `article.reveal reveal-delay` nas etapas 02/04).

Igual à Fatia 4, cada `SupportStep` precisa ser um `<article>` — reaproveita o `Reveal` com `as="article"` já disponível desde a Fatia 4 (nenhuma mudança adicional necessária no `Reveal`).

### 3.3 `SupportStep` (presentational)

Props: `number`, `title`, `description`, `icon`, `delay?`. Renderiza:

```tsx
<Reveal as="article" delay={delay}>
  <span>{number}</span>
  <div className="step-icon">
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d={icon} /></svg>
  </div>
  <h3>{title}</h3>
  <p>{description}</p>
</Reveal>
```

Estrutura idêntica ao baseline (`<article><span>01</span><div class="step-icon"><svg>...</svg></div><h3>...</h3><p>...</p></article>`).

## 4. Estratégia de migração de CSS

Seletores a portar integralmente para um novo bloco `/* ===== Fatia 5 — Atendimento ===== */` em `globals.css`:

- `.support`
- `.support-heading`
- `.support-heading .eyebrow`
- `.support-heading h2`
- `.support-heading p`
- `.support-steps`
- `.support-steps article`
- `.support-steps article::before`
- `.support-steps article > span`
- `.step-icon`
- `.step-icon svg`
- `.support-steps h3`
- `.support-steps p`

Breakpoint 1050px: `.support-steps { grid-template-columns: 1fr 1fr; row-gap: 40px; }` (linha 266 do baseline).

Breakpoint 820px: `.support-heading { grid-template-columns: 1fr; }` e `.support-heading p { margin-top: 24px; }` (linhas 307-308).

Breakpoint 560px: o baseline tem o seletor combinado `.section-heading h2 br, .support-heading h2 br { display: none; }` (linha 332) — a parte `.section-heading h2 br` já foi portada na Fatia 4; nesta fatia porto apenas o complemento `.support-heading h2 br { display: none; }`. Além disso: `.support-steps { grid-template-columns: 1fr; border-top: 0; margin-top: 48px; }`, `.support-steps article { padding: 25px; border: 1px solid var(--line); border-radius: 12px; background: var(--white); }`, `.support-steps article::before { display: none; }`, `.step-icon { box-shadow: none; background: #eef3fa; }` (linhas 342-345).

Fora de escopo, não tocar: `.product-support-inner*` (linhas 236, 273-274, 360 — pertence à futura página de produto, Tarefa 4), `.presence-*`, `.cta-*`, `.footer-*`, `.map-*`.

## 5. Contrato de testes proposto

`SupportStep.test.tsx`:
1. Renderiza `number`, `title`, `description` e o ícone (`svg[aria-hidden="true"]` com o `path` correto).
2. Aplica classe `reveal-delay` quando `delay` é `true` (via `Reveal`).

`SupportSection.test.tsx`:
1. `region` com `id="atendimento"` e heading nível 2 com o texto aprovado.
2. Renderiza as 4 etapas na ordem do baseline (01 Entendimento, 02 Instalação, 03 Suporte, 04 Pós-venda).
3. Etapas de índice 1 e 3 (02 e 04) recebem `reveal-delay`; 0 e 2 (01 e 03) não.

## 6. Validações automatizadas e manuais

Automatizadas: typecheck, `vitest run`, `npm run test:static`, `next build`, `git diff --check`.

Manuais (visuais, a cargo de Jose): grid de 4 colunas no desktop, 2 colunas em ≤1050px, 1 coluna com cards em borda/fundo branco em ≤560px; heading em 2 colunas ≥820px e empilhado abaixo disso; animação de entrada (fade/slide) nas 4 etapas.

## 7. Riscos e decisões pendentes

Nenhuma decisão bloqueante identificada — esta fatia é estruturalmente mais simples que a Fatia 4 (sem estado, sem filtro, sem `next/image`, sem remapeamento de categorias). Único ponto a confirmar com Jose:

- **D1:** confirmar nomes/local dos arquivos — `SupportSection`/`SupportStep` em `src/components/support/`, seguindo o padrão de `src/components/solutions/` das fatias anteriores. Caso prefira `src/components/sections/` para `SupportSection` (como `AboutSection`/`SolutionsSection`) e `src/components/support/` apenas para `SupportStep`+dados, informar.

Proposta de commit atômico ao final: `feat: implementar SupportSection com etapas de atendimento (Tarefa 3.5)`.

## 8. Bloco de status

Status: **PROPOSTA — AGUARDANDO APROVAÇÃO DE JOSE**. Nenhum código foi criado ou alterado por esta proposta; a implementação, quando aprovada, fica a cargo do Codex, seguida de revisão técnica do Claude antes de qualquer commit.
