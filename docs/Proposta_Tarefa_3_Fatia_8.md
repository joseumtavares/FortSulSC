# Proposta técnica — Tarefa 3, Fatia 8 (CTA final — #contato)

Status: PROPOSTA — AGUARDANDO APROVAÇÃO DE JOSE (nenhum código foi criado ou alterado por esta proposta)
Data: 29/08/2026

## 0. Estado do repositório e fontes consultadas

- Commit mais recente: `fdcc175 merge: concluir Fatia 3.7 e correções mobile` (incorpora `63718fb`, ContentSection/Fatia 3.7 já revisada e aprovada).
- `git status --short` confirma que não há arquivos desta fatia pendentes na árvore — as entradas existentes (`.agents/`, `.mcp.json`, `docs/CODEBASE_MAP.md`, `docs/Proposta_Tarefa_3_Fatia_2/3/4/5/6/7.md`, `skills-lock.json`) são anteriores e não pertencem a esta proposta.
- Lidos nesta sessão: `index.html` (linhas 294-306, seção `.cta-section` e início do `<footer>`), `styles.css` (linhas 180-182, breakpoints 820px linha 302 e 560px linha 347), `docs/COMPONENTS.md` (§3.12 `CtaSection`, já existente e sem alteração de conteúdo necessária, só o número da seção muda por causa da Fatia 7), `src/app/page.tsx` (composição atual), `src/components/whatsapp/WhatsAppTrigger.tsx`, `src/components/ui/Reveal.tsx`, `src/components/solutions/SolutionCard.tsx` (precedente do ícone de seta, mesmo `<path d="M5 12h14M13 6l6 6-6 6" />` usado no CTA final do baseline).
- `next: ^16.2.9` inalterado.

## 0.1 Mapeamento desta fatia

"Fatia 8" = seção `.cta-section` / `#contato` do baseline, a última seção dentro de `<main>`, entre "Novidades e dicas" (`ContentSection`, já migrada) e o `<footer>` (`SiteFooter`, já migrado). Com esta fatia, a Home fica com paridade estrutural completa em relação ao baseline estático.

## 1. Objetivo, escopo incluído e exclusões

Objetivo: migrar a seção CTA final ("Vamos conversar?" / "O próximo ganho de eficiência pode começar aqui." + botão "Falar com a FortSul") do HTML/CSS estático para React/Next.js, preservando exatamente texto, layout e comportamento.

Incluído:
- `CtaSection` (Server Component) — bloco único, sem subcomponente novo (o baseline não tem repetição/lista aqui, ao contrário das fatias anteriores).
- Reaproveitamento de `WhatsAppTrigger` (já existente) para o botão, com o ícone de seta como `children` (mesmo `<path d="M5 12h14M13 6l6 6-6 6" />` já usado em `SolutionCard.tsx`).
- Reaproveitamento de `Reveal` sem qualquer alteração (`as="div"` já é o default; nenhuma extensão de prop é necessária nesta fatia).
- Migração das regras CSS correspondentes (`.cta-section`, `.cta-inner`, `.cta-inner h2`) para `src/app/globals.css`, incluindo os dois breakpoints existentes.
- Composição em `src/app/page.tsx` (`<CtaSection />` após `<ContentSection />`).
- Atualização de `docs/COMPONENTS.md`: a entrada `### 3.12 CtaSection` já existe (criada/renumerada na Fatia 7) e já descreve corretamente o componente; nenhuma mudança de conteúdo é necessária, só confirmar que o status deixa de ser "planejado" para "implementado" após o merge desta fatia.

Excluído (fora desta fatia):
- Qualquer ajuste em `SiteFooter` (já implementado, fora de escopo).
- Qualquer backend, banco de dados, autenticação ou regra de negócio — a seção é estática, sem dado dinâmico, formulário ou informação sensível.
- Substituição de textos/CTA por conteúdo diferente do já aprovado — copiado literalmente do baseline.

## 2. Por que não precisa de Client Component

Igual às fatias anteriores: nenhum estado próprio. A única interatividade é o CTA (`WhatsAppTrigger`, já Client Component compartilhado) e a animação de entrada (`Reveal`, já Client Component compartilhado). `CtaSection` permanece 100% Server Component.

## 3. Estrutura e responsabilidades

### 3.1 `src/components/sections/CtaSection.tsx` (Server)

Renderiza `<section className="cta-section" id="contato">`, com:

```tsx
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export function CtaSection() {
  return (
    <section className="cta-section" id="contato">
      <Reveal className="container cta-inner">
        <div>
          <span className="eyebrow eyebrow-light">Vamos conversar?</span>
          <h2>O próximo ganho de eficiência pode começar aqui.</h2>
        </div>
        <WhatsAppTrigger className="button button-light" ariaLabel="Falar com a FortSul pelo WhatsApp">
          Falar com a FortSul
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </WhatsAppTrigger>
      </Reveal>
    </section>
  )
}
```

Texto e estrutura copiados literalmente de `index.html` linhas 294-306.

Observação: `Reveal` recebe `className="container cta-inner"` (mesmo padrão já usado em outras seções para compor a classe `container` do design system junto com a classe específica da seção, ex.: `.content-heading` na Fatia 7).

## 4. Estratégia de migração de CSS

Seletores a portar integralmente para um novo bloco `/* ===== Fatia 8 — CTA final ===== */` em `globals.css`:

- `.cta-section`
- `.cta-inner`
- `.cta-inner h2`

Breakpoint 820px (linha 302 do baseline): `.cta-inner` entra na regra combinada `.section-heading, .cta-inner { align-items: flex-start; flex-direction: column; }` — já existe uma regra `.section-heading` portada em fatia anterior; esta fatia só precisa adicionar `.cta-inner` ao seletor combinado equivalente em `globals.css` (ou replicar a mesma declaração num bloco próprio, o que for mais consistente com o que já existe no arquivo — decisão de implementação, sem impacto visual).

Breakpoint 560px (linha 347 do baseline): `.cta-section { padding-block: 70px; }`.

Fora de escopo, não tocar: `.footer-*`, `.content-*` (Fatia 7, já portada).

## 5. Contrato de testes proposto

`CtaSection.test.tsx`:
1. `region`/`section` com `id="contato"` e heading nível 2 "O próximo ganho de eficiência pode começar aqui.".
2. Texto do eyebrow "Vamos conversar?" presente.
3. CTA usa `WhatsAppTrigger` com texto "Falar com a FortSul"; teste de fluxo real (render dentro de `WhatsAppProvider` + clique + diálogo aberto), mesmo padrão validado e aprovado nas Fatias 6 e 7.

## 6. Validações automatizadas e manuais

Automatizadas: typecheck, `vitest run`, `npm run test:static`, `next build`, `git diff --check`.

Manuais (visuais, a cargo de Jose): layout lado a lado no desktop (texto à esquerda, botão à direita), empilhado em ≤820px, botão abre o `WhatsAppDialog` corretamente, gradiente de fundo e espaçamento (`padding-block`) iguais ao baseline nos três tamanhos de tela já usados nas fatias anteriores (1440×900, 1024×768, 800×1024, 390×844).

## 7. Riscos e decisões pendentes

- Nenhum dado sensível, nenhuma decisão de negócio, nenhuma dependência nova.
- Único ponto de atenção técnica (não bloqueante): como portar o breakpoint 820px do seletor combinado `.section-heading, .cta-inner` do baseline — fica a critério do Codex escolher entre estender o seletor existente ou declarar `.cta-inner` isoladamente, desde que o resultado visual seja idêntico ao baseline.
- Com esta fatia, a Home alcança paridade estrutural completa com o baseline estático (todas as seções de `<main>` e `<footer>` migradas). Sugestão para o próximo ciclo, fora desta proposta: revisão geral de regressão da Home completa (todas as fatias juntas) antes de considerar a Fase 2 "Home" encerrada — decisão que cabe a Jose, não implementação.

Proposta de commit atômico ao final: `feat: implementar CtaSection final (Tarefa 3.8)`.

## 8. Bloco de status

Status: **PROPOSTA — AGUARDANDO APROVAÇÃO DE JOSE**. Nenhum código foi criado ou alterado por esta proposta; após aprovação, a implementação fica a cargo do Codex (que pode sugerir melhorias à proposta ou implementar e testar diretamente, em branch/worktree próprio conforme `docs/FortSulSC_instrucoes_Hermes_Codex.md` §6.3), seguida de revisão técnica do Claude sobre o resumo trazido por Jose, antes de qualquer merge para `main`.
