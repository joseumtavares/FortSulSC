# Proposta técnica — Tarefa 3, Fatia 7 (Novidades e dicas)

Status: PROPOSTA — AGUARDANDO APROVAÇÃO DE JOSE (nenhum código foi criado ou alterado por esta proposta)
Data: 29/08/2026

## 0. Estado do repositório e fontes consultadas

- Commit mais recente: `ca15453 merge: PresenceSection (Tarefa 3.6)`.
- `git status --short` confirma árvore limpa quanto aos arquivos desta fatia — pendências pré-existentes (`.agents/`, `.mcp.json`, `docs/CODEBASE_MAP.md`, `docs/Proposta_Tarefa_3_Fatia_2/3/4/5/6.md`, `skills-lock.json`) não pertencem a esta proposta.
- Lidos nesta sessão: `index.html` (linhas 241-289), `styles.css` (linhas 166-178, breakpoints 820px linhas 304-306 e 560px linhas 338-341), `docs/COMPONENTS.md` (§3.7-3.10, ausência de entrada para esta seção), `docs/PLANO_MESTRE_FORTSULSC.md` (linha 320 — Jose já aprovou este incremento estático com o conteúdo de teste em 27/08/2026, pendência de substituição por conteúdo real antes da publicação permanece aberta e não é resolvida por esta fatia), `src/app/page.tsx`, `src/components/support/SupportStep.tsx` e `src/components/ui/Reveal.tsx` (padrão de componente-item + Reveal reaproveitado do Fatia 5), `src/components/whatsapp/WhatsAppTrigger.tsx`.
- Dimensões reais confirmadas via `file` em `public/image/`: `alimentador-reto-banner1.webp` 1942×809 (igual ao atributo do baseline), `queimador.webp` 1600×1200 (igual ao atributo do baseline), `FrtSulSC_Mapa-Representantes-Estados-Ativos.png` 1254×1254 — **diferente** do atributo usado nesse cartão específico no baseline (`width="1231" height="1205"`); ver risco na seção 7.
- `next: ^16.2.9` inalterado.

## 0.1 Mapeamento desta fatia

"Fatia 7" (nomenclatura de Jose) = seção `#novidades-e-dicas` do baseline (`section.content-section`), a sexta seção da Home, entre Presença e o CTA final (`#contato`, que fica para a Fatia 8).

## 1. Objetivo, escopo incluído e exclusões

Objetivo: migrar a seção "Novidades e dicas" (heading + grade de 3 cartões + CTA final "Falar com a FortSul") do HTML/CSS estático para React/Next.js, preservando exatamente o layout, texto, imagens e comportamento já aprovados — incluindo o conteúdo de teste que Jose aprovou em 27/08/2026 (Plano Mestre, linha 320).

Incluído:
- `ContentSection` (Server Component) — heading (`content-heading`), grade `content-grid` com 3 `ContentCard` e CTA final via `WhatsAppTrigger`.
- `ContentCard` (Server Component) — um cartão individual (imagem + título + descrição), análogo ao par `SupportSection`/`SupportStep` já usado na Fatia 5.
- `content-data.ts` — array com os 3 itens de conteúdo, copiados literalmente do baseline (mesmas imagens, mesmo texto, mesmo comentário `<!-- TESTE -->` preservado como comentário JSX explicando a pendência).
- Extensão pontual de `Reveal` (`src/components/ui/Reveal.tsx`): adicionar `'li'` ao union do prop `as` (hoje `'article' | 'div'`), para preservar exatamente a estrutura do baseline (`<li class="reveal"><article class="content-card">`), sem precisar reestruturar o HTML. Mesmo padrão de extensão pontual já usado na Fatia 4 (`as="article"`) e Fatia 5 (`delay`/`dataCategory`/`ariaLabel`).
- Migração das regras CSS correspondentes (`.content-section`, `.content-heading*`, `.content-grid*`, `.content-card*`, `.content-cta`) para `src/app/globals.css`.
- Composição em `src/app/page.tsx` (`<ContentSection />` após `<PresenceSection />`).
- Preenchimento da lacuna em `docs/COMPONENTS.md`: hoje não existe nenhuma entrada para esta seção entre §3.9 (PresenceSection) e §3.10 (CtaSection). Esta proposta inclui inserir `### 3.10 ContentSection` e `### 3.11 ContentCard`, renumerando sequencialmente as seções seguintes (`CtaSection` 3.10→3.11, `SiteFooter` 3.11→3.12, `FloatingWhatsApp` 3.12→3.13, `WhatsAppDialog` 3.13→3.14, `RepresentativeMap` 3.14→3.15, `AdminShell` 3.15→3.16). Puramente documental, sem impacto em código.

Excluído (fora desta fatia):
- Seção CTA final (`.cta-section`, `#contato`) — fica para a Fatia 8.
- Substituição do conteúdo de teste (`<!-- TESTE -->`) por conteúdo real — é uma decisão de conteúdo/negócio já registrada como pendência aberta no Plano Mestre (linha 320); esta fatia só migra o que já está aprovado, não decide conteúdo novo.
- Qualquer ajuste de rodapé.
- Qualquer backend, banco de dados, autenticação ou regra de negócio — a seção é estática, sem dado dinâmico ou sensível.

## 2. Por que não precisa de Client Component

Igual às fatias anteriores, esta seção não tem estado, formulário ou interatividade além do CTA (já um Client Component compartilhado, `WhatsAppTrigger`) e da animação de entrada (`Reveal`, também compartilhado). `ContentSection` e `ContentCard` permanecem 100% Server Components, no mesmo padrão de `SupportSection`/`SupportStep`.

## 3. Estrutura e responsabilidades

### 3.1 `src/data/content-data.ts` (ou `src/components/content/content-data.ts`, mesmo diretório-padrão de `solutions-data.ts`/`support-data.ts`)

Array `ContentCardData[]` com os 3 itens do baseline, na ordem exata:
1. imagem `alimentador-reto-banner1.webp` (1942×809) — "Como escolher o alimentador ideal" / "Dicas para dimensionar o alimentador certo para o seu processo."
2. imagem `queimador.webp` (1600×1200) — "Cuidados com queimadores industriais" / "Boas práticas de manutenção para prolongar a vida útil do equipamento."
3. imagem `FrtSulSC_Mapa-Representantes-Estados-Ativos.png` (dimensão real 1254×1254, ver seção 7) — "FortSul em todo o Brasil" / "Conheça a rede de representantes da FortSul nos estados ativos."

Cada item: `{ image: { src, alt, width, height }, title, description }`.

### 3.2 `src/components/content/ContentCard.tsx` (Server)

Recebe `{ item, delay }: { item: ContentCardData; delay?: boolean }` e renderiza:
```tsx
<Reveal as="li" delay={delay}>
  <article className="content-card">
    <div className="content-card-media">
      <Image src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" />
    </div>
    <div className="content-card-body">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  </article>
</Reveal>
```
(requer o ajuste em `Reveal` descrito na seção 1 para aceitar `as="li"`.)

### 3.3 `src/components/sections/ContentSection.tsx` (Server)

Renderiza `<section className="section content-section" id="novidades-e-dicas" aria-labelledby="novidades-e-dicas-title">`, com:
- `.content-heading` (dentro de `Reveal`): `eyebrow` ("Dicas FortSul"), `h2` ("Novidades e dicas"), `p` (texto de apoio).
- `<ul className="content-grid" aria-labelledby="novidades-e-dicas-title">` com `content-data.map((item, i) => <ContentCard key={item.title} item={item} delay={i % 2 === 1} />)` — alternando `reveal`/`reveal-delay` como no baseline (itens 1 e 3 sem delay, item 2 com delay).
- CTA final:
  ```tsx
  <WhatsAppTrigger className="button button-dark content-cta" ariaLabel="Falar com a FortSul pelo WhatsApp">
    Falar com a FortSul
  </WhatsAppTrigger>
  ```

Texto e estrutura copiados literalmente de `index.html` linhas 241-289 (mesma disciplina das fatias anteriores).

## 4. Estratégia de migração de CSS

Seletores a portar integralmente para um novo bloco `/* ===== Fatia 7 — Novidades e dicas ===== */` em `globals.css`:

- `.content-section`
- `.content-heading`
- `.content-heading h2`
- `.content-heading > p`
- `.content-grid`
- `.content-grid > li`
- `.content-card`
- `.content-card-media`
- `.content-card-media img`
- `.content-card-body`
- `.content-card-body h3`
- `.content-card-body p`
- `.content-cta`

Breakpoint 820px (linhas 304-306 do baseline): `.content-heading { align-items: flex-start; flex-direction: column; }`, `.content-heading > p { width: auto; max-width: 450px; }`, `.content-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }`.

Breakpoint 560px (linhas 338-341 do baseline): `.content-grid { grid-template-columns: 1fr; margin-top: 36px; }`, `.content-card-media { height: 220px; }`, `.content-card-body { min-height: 0; padding: 19px; }`, `.content-card-body h3 { font-size: 18px; }`.

Fora de escopo, não tocar: `.cta-*` (Fatia 8), `.footer-*` (já portado).

## 5. Contrato de testes proposto

`ContentSection.test.tsx`:
1. `region` com `id="novidades-e-dicas"` e heading nível 2 "Novidades e dicas".
2. Renderiza os 3 títulos de cartão (`getByRole('heading', { level: 3, name: ... })` para cada um).
3. Renderiza as 3 imagens com `alt` correto.
4. CTA final usa `WhatsAppTrigger` com texto "Falar com a FortSul"; teste de fluxo real (render dentro de `WhatsAppProvider` + clique + diálogo aberto), mesmo padrão validado e aprovado na Fatia 6.

`ContentCard.test.tsx` (opcional, se o Codex preferir isolar): renderiza um item mockado e confere título/descrição/imagem.

## 6. Validações automatizadas e manuais

Automatizadas: typecheck, `vitest run`, `npm run test:static`, `next build`, `git diff --check`.

Manuais (visuais, a cargo de Jose): grade de 3 colunas no desktop, 2 colunas em ≤820px, 1 coluna em ≤560px; cartões com imagem cobrindo a área fixa (`object-fit: cover`) sem distorção; CTA final abre o `WhatsAppDialog` corretamente.

## 7. Riscos e decisões pendentes

- **Dimensão divergente da imagem do mapa neste cartão:** o baseline usa `width="1231" height="1205"` para `FrtSulSC_Mapa-Representantes-Estados-Ativos.png` neste cartão específico, mas o arquivo real é 1254×1254 (mesmo arquivo já usado na Fatia 6 com as dimensões corretas). Como `.content-card-media img` força `width: 100%; height: 100%; object-fit: cover` dentro de um contêiner de altura fixa (230px/220px), a proporção informada ao `next/image` não afeta o layout final — mas, para evitar o aviso de mismatch do Next.js, esta proposta usa a dimensão real do arquivo (1254×1254) em vez do atributo do baseline. Sinalizado aqui para aprovação; não é uma decisão de dado sensível nem de negócio.
- **Conteúdo de teste:** os 3 cartões e seus textos continuam sendo o conteúdo de exemplo já aprovado por Jose em 27/08/2026 (Plano Mestre, linha 320); a substituição por conteúdo real permanece pendência aberta, fora do escopo desta fatia.
- **Extensão de `Reveal`:** adicionar `'li'` ao union do prop `as` é uma mudança pequena em componente compartilhado; segue o mesmo padrão já aprovado nas Fatias 4 e 5, sem alterar o comportamento de nenhum uso existente (`as` continua opcional, default `'div'`).
- Nenhuma decisão bloqueante de escopo, dado sensível ou regra de negócio identificada — seção puramente estática.

Proposta de commit atômico ao final: `feat: implementar ContentSection com grade de novidades (Tarefa 3.7)`.

## 8. Bloco de status

Status: **PROPOSTA — AGUARDANDO APROVAÇÃO DE JOSE**. Nenhum código foi criado ou alterado por esta proposta; após aprovação, a implementação fica a cargo do Codex (que pode sugerir melhorias à proposta ou implementar e testar diretamente, em branch/worktree próprio conforme `docs/FortSulSC_instrucoes_Hermes_Codex.md` §6.3), seguida de revisão técnica do Claude sobre o resumo trazido por Jose, antes de qualquer merge para `main`.
