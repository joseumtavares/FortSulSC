# Proposta técnica — Tarefa 3, Fatia 6 (Presença)

Status: APROVADO POR JOSE EM 29/08/2026 — AGUARDANDO ANÁLISE/IMPLEMENTAÇÃO DO CODEX (nenhum código foi criado ou alterado por esta proposta)
Data: 29/08/2026

## 0. Estado do repositório e fontes consultadas

- Commit mais recente: `e0d5667 docs: formalizar branch/worktree por agente e Git exclusivo de Jose`.
- `git status --short` confirma árvore limpa quanto aos arquivos desta fatia — mudanças pendentes existentes (`.agents/`, `.mcp.json`, `docs/CODEBASE_MAP.md`, `docs/Proposta_Tarefa_3_Fatia_2/3/4/5.md`, `skills-lock.json`) são pré-existentes e não pertencem a esta proposta.
- Divergência corrigida nesta sessão: `docs/PLANO_MESTRE_FORTSULSC.md` estava com a tabela de status defasada em relação ao Git (commit `3ee6034`); já reconciliado antes desta proposta.
- Lidos nesta sessão: `index.html` (linhas 227-239), `styles.css` (linhas 155-164, 254-346, breakpoints 1050/820/560px), `docs/COMPONENTS.md` (§3.9 PresenceSection, §3.14 RepresentativeMap), `docs/PLANO_MESTRE_FORTSULSC.md` (Fase 5 — gating do mapa interativo), `src/components/whatsapp/WhatsAppTrigger.tsx` e seus usos em `SiteFooter.tsx`/`SiteHeader.tsx`/`SolutionCard.tsx`/`FloatingWhatsApp.tsx`, `src/components/sections/AboutSection.tsx` (referência de Server Component com `next/image` + `Reveal`), `src/app/page.tsx`/`layout.tsx`.
- Dimensão real do arquivo de imagem confirmada via `file`: `public/image/FrtSulSC_Mapa-Representantes-Estados-Ativos.png` — PNG 1254×1254px.
- `next: ^16.2.9` inalterado.

## 0.1 Mapeamento desta fatia

"Fatia 6" (nomenclatura de Jose) = seção `#presenca` do baseline (`section.presence`), a quinta seção da Home após Hero, CategoryStrip/Sobre, Soluções e Atendimento.

## 1. Objetivo, escopo incluído e exclusões

Objetivo: migrar a seção "Presença" (heading + parágrafo + CTA + imagem estática do mapa de representantes) do HTML/CSS estático para React/Next.js, preservando exatamente o layout, texto e comportamento aprovados.

Incluído:
- `PresenceSection` (Server Component) — heading (`presence-copy`), CTA via `WhatsAppTrigger` e imagem do mapa (`map-wrap`), conforme já especificado em `docs/COMPONENTS.md` §3.9.
- Migração das regras CSS correspondentes (`.presence*`, `.map-wrap*`) para `src/app/globals.css`.
- Composição em `src/app/page.tsx` (`<PresenceSection />` após `<SupportSection />`).

Excluído (fora desta fatia):
- `RepresentativeMap` interativo (Leaflet/OpenStreetMap) — `docs/COMPONENTS.md` §3.14 o documenta como "planejado, não implementado"; pertence à Fase 5 do Plano Mestre ("Mapa e dados públicos"), que depende da conclusão da Fase 4 e de decisão prévia sobre quais dados de representante são públicos. Esta fatia usa apenas a imagem estática já usada no baseline.
- Seção "Novidades e dicas" (`#novidades-e-dicas`) — tem pendência própria de conteúdo placeholder (comentário `<!-- TESTE -->` no baseline, registrado no Plano Mestre).
- Seção CTA final (`.cta-section`) e qualquer ajuste de rodapé.
- Qualquer backend, banco de dados, autenticação ou regra de negócio — a seção é estática, sem dado dinâmico ou sensível.

## 2. Por que não precisa de Client Component

Igual à Fatia 5, esta seção não tem estado, formulário ou interatividade além do CTA (que já é um Client Component compartilhado, `WhatsAppTrigger`) e da animação de entrada (`Reveal`, também compartilhado). `PresenceSection` permanece 100% Server Component, no mesmo padrão de `AboutSection`.

## 3. Estrutura e responsabilidades

### 3.1 `src/components/sections/PresenceSection.tsx` (Server)

Renderiza `<section className="section presence" id="presenca" aria-labelledby="presence-title">`, container (`presence-grid`) com:
- `.presence-copy` (envolvido em `Reveal`): `eyebrow` ("Perto de quem produz"), `h2` ("Representantes em diferentes regiões do Brasil."), `p` (texto de apoio) e o CTA:
  ```tsx
  <WhatsAppTrigger className="button button-dark whatsapp-trigger" ariaLabel="Encontrar representante via WhatsApp">
    Encontrar representante
  </WhatsAppTrigger>
  ```
- `.map-wrap` (envolvido em `Reveal` com `delay`, replicando `reveal reveal-delay` do baseline): `next/image` com `src="/image/FrtSulSC_Mapa-Representantes-Estados-Ativos.png"`, `width={1254}` `height={1254}`, `alt="Mapa de atuação dos representantes FortSul"`, preservando `loading="lazy"` (padrão do `next/image` fora do viewport inicial).

Texto e estrutura copiados literalmente de `index.html` linhas 227-239 (mesma disciplina das fatias anteriores: preservar copy exata do baseline).

## 4. Estratégia de migração de CSS

Seletores a portar integralmente para um novo bloco `/* ===== Fatia 6 — Presença ===== */` em `globals.css`:

- `.presence`
- `.presence-grid`
- `.presence-copy h2`
- `.presence-copy p`
- `.map-wrap`
- `.map-wrap::before`
- `.map-wrap::after`
- `.map-wrap img`

Breakpoint 820px (linhas 299, 309-311 do baseline — hoje dividido entre o seletor combinado `.about-grid, .presence-grid` já parcialmente portado nas fatias anteriores): `.presence-grid { grid-template-columns: 1fr; }` (complemento da regra combinada — a parte `.about-grid` já foi portada antes), `.presence-grid { gap: 30px; }`, `.presence-copy { max-width: 590px; }`, `.map-wrap { min-height: 430px; }`.

Breakpoint 560px (linha 346): `.map-wrap { min-height: 340px; }`.

Fora de escopo, não tocar: `.footer-grid` (linha 312, mesmo bloco de media query do baseline, já portado nas fatias de Header/Footer), `.cta-*`, `.content-*`.

## 5. Contrato de testes proposto

`PresenceSection.test.tsx`:
1. `region` com `id="presenca"` e heading nível 2 com o texto aprovado.
2. Renderiza o parágrafo de apoio.
3. Renderiza a imagem do mapa com o `alt` correto.
4. CTA usa `WhatsAppTrigger` com o texto "Encontrar representante" (reaproveitar padrão de teste já usado em `whatsapp-flow.test.tsx`/`SolutionCard.test.tsx` para simular abertura do diálogo).

## 6. Validações automatizadas e manuais

Automatizadas: typecheck, `vitest run`, `npm run test:static`, `next build`, `git diff --check`.

Manuais (visuais, a cargo de Jose): grid de 2 colunas (`.8fr 1.2fr`) no desktop, empilhado em ≤820px; círculos decorativos (`::before`/`::after`) centralizados atrás da imagem em todos os breakpoints; CTA abre o `WhatsAppDialog` corretamente; imagem sem distorção/corte inesperado nos 4 breakpoints padrão (1440×900, 1024×768, 800×1024, 390×844).

## 7. Riscos e decisões pendentes

- **Risco de layout shift/distorção:** usar as dimensões reais confirmadas (1254×1254) no `next/image`; se o design aprovado depender de um recorte/proporção diferente da imagem original, sinalizar antes de implementar.
- **Posicionamento dos pseudo-elementos decorativos:** `.map-wrap::before`/`::after` dependem de `position: relative` no wrapper — conferir que a estrutura JSX não introduz um container extra entre `.map-wrap` e a imagem que quebre esse posicionamento.
- **Seletor combinado `.about-grid, .presence-grid` no breakpoint 820px:** como a parte `.about-grid` já foi portada em fatia anterior, confirmar no código atual de `globals.css` se a regra já existe de forma dividida ou combinada antes de adicionar a parte de `.presence-grid`, para não duplicar seletor.
- Nenhuma decisão bloqueante de escopo, dado sensível ou regra de negócio identificada — seção puramente estática.

Proposta de commit atômico ao final: `feat: implementar PresenceSection com CTA e mapa estático (Tarefa 3.6)`.

## 8. Bloco de status

Status: **APROVADO POR JOSE EM 29/08/2026**. Nenhum código foi criado ou alterado por esta proposta; a implementação fica a cargo do Codex (que pode sugerir melhorias à proposta ou implementar e testar diretamente, em branch/worktree próprio conforme `docs/FortSulSC_instrucoes_Hermes_Codex.md` §6.3), seguida de revisão técnica do Claude sobre o resumo trazido por Jose, antes de qualquer merge para `main`.
