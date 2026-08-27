# Backlog de Funcionalidades Futuras — FortSulSC

> Este documento registra funcionalidades avaliadas e **conscientemente adiadas** — não são ideias soltas, são propostas que já passaram por uma avaliação técnica e estratégica, com especificação suficiente para implementação futura sem repetir a análise.
>
> Qualquer item aqui só entra em execução depois de: (1) satisfazer os critérios de pré-implementação listados no próprio item, e (2) aprovação explícita do Jose no momento da execução, mesmo que já tenha sido "aprovado" como ideia.
>
> Referenciado a partir de `PLANO_MESTRE_FORTSULSC.md`.

---

## 1. Scroll-Pinned Product Showcase — Bioqueimador de Cavaco

**Status:** 🔴 Não iniciado — registrado para avaliação futura.
**Data do registro:** 27/08/2026.
**Origem:** solicitação do Jose para animação de scroll do "Bioqueimador de Cavaco"; avaliada antes de qualquer código, conforme protocolo da seção 4 do Plano Mestre.

### 1.1 Por que foi adiado (resumo da avaliação)

- "Bioqueimador de Cavaco" **não existe hoje** como produto no site nem nos documentos de planejamento — não há página, imagem com fundo transparente, nome oficial, categoria ou copy aprovado. O catálogo real de produtos é escopo da **Fase 3 (🔴 não iniciada, não autorizada)**.
- O frontend atual (Fase 1) não tem bundler nem nenhuma dependência JS externa (`package.json` sem dependencies, sem `node_modules`). Introduzir GSAP agora seria a primeira dependência externa do site, via CDN, contrariando a diretriz de evitar dependências desnecessárias — ou exigiria montar infraestrutura de build que pertence à Fase 2 (ainda com sete decisões pendentes).
- O site atual tem Lighthouse 0,95–1,0 em performance e 1,0 em SEO/boas práticas; um efeito de pinning mal calibrado é risco clássico de CLS/regressão em mobile, e não vale o risco por um produto ainda não validado no catálogo.

### 1.2 Objetivo

Apresentar um equipamento industrial de forma premium durante o scroll: a imagem do equipamento permanece fixa (pinned) na viewport enquanto uma narrativa textual avança ao redor, transmitindo solidez e tecnologia sem exagero visual.

### 1.3 Experiência desejada

1. Usuário entra na seção → o equipamento assume posição fixa na viewport.
2. Scroll continua → o conteúdo textual ao redor avança por estágios (2–4 blocos narrativos curtos).
3. O equipamento recebe microanimações sutis sincronizadas a cada estágio (leve escala, opacidade, parallax leve) — nunca movimento livre ou exagerado.
4. Ao fim da seção, o equipamento é liberado e o fluxo normal da página continua.
5. Funciona corretamente tanto no scroll para baixo quanto para cima, sem saltos.

### 1.4 Biblioteca/tecnologia recomendada

**GSAP + ScrollTrigger** — não ScrollMagic.

Justificativa técnica (validada via Context7 em 27/08/2026):

- ScrollMagic está essencialmente sem manutenção ativa e não tem suporte nativo a `matchMedia`/`prefers-reduced-motion` — exigiria soluções manuais para responsividade e acessibilidade.
- ScrollTrigger tem `pin`, `scrub`, `start`/`end` e `gsap.matchMedia()` nativos, incluindo o padrão oficial para condicionar animação por breakpoint e por `prefers-reduced-motion` num único bloco.
- GSAP (incluindo ScrollTrigger) é gratuito para uso comercial desde o patrocínio da Webflow, removendo a barreira de licenciamento que existia antes.

### 1.5 Dependências necessárias (hoje ausentes)

- Imagem/render do equipamento com fundo transparente, em pelo menos 2–3 resoluções (asset não existe — só há `image/queimador.webp`, que é de outro produto e tem fundo).
- Nome oficial, categoria e copy narrativo do produto, aprovados (produto ainda não está no catálogo nem na Fase 3).
- Decisão sobre carregar GSAP via CDN (ainda na Fase 1 estática) ou via npm com bundler (Fase 2/Next.js) — recomendação: esperar o bundler, para permitir tree-shaking e versão travada localmente em vez de CDN solto.

### 1.6 Possíveis impactos na arquitetura

- Seria a primeira dependência JS externa do site — decisão que merece registro formal (self-host vs CDN, versão travada).
- Se implementado antes da Fase 2, antecipa a necessidade de bundler fora da ordem planejada.

### 1.7 Requisitos de responsividade

- Usar `gsap.matchMedia()` para restringir o pin a desktop/tablet (ex.: acima de 820px, mesmo breakpoint já usado no menu mobile em `styles.css`).
- Abaixo do breakpoint, substituir por fade/parallax simples sem `pin`, priorizando fluidez sobre paridade visual com desktop.

### 1.8 Requisitos de performance

- Animar somente `transform`/`opacity`.
- `scrub` com suavização (ex.: `scrub: 1`), sem `markers` em produção.
- Carregar o script de forma adiada (defer, ou só ao entrar em viewport via `IntersectionObserver`) para não regredir LCP/TBT.
- Critério de aceite: não reduzir o score de Performance do Lighthouse abaixo de 0,90 nas páginas afetadas.
- Respeitar `prefers-reduced-motion` (já há um padrão equivalente em `styles.css:251` — reaproveitar a mesma media query).

### 1.9 Riscos

- CLS se as dimensões da seção não forem reservadas antes do JS carregar.
- Possível interação indesejada com `scroll-behavior: smooth`, já definido em `html` no `styles.css` atual — precisa de teste dedicado.
- Falha de rede/CDN deve degradar graciosamente: a seção precisa continuar funcionando como scroll normal (sem pin) se o script não carregar.

### 1.10 Momento/fase mais apropriada

Depois que a Fase 3 (catálogo real de produtos) aprovar formalmente "Bioqueimador de Cavaco" como item do catálogo (nome, categoria, assets) — idealmente já dentro da Fase 2/Next.js, quando existir bundler para importar GSAP via npm em vez de CDN solto no site estático atual.

### 1.11 Critérios que devem ser atendidos antes de implementar

1. Produto aprovado no catálogo oficial (nome, categoria, dentro dos ~10 itens da Fase 3).
2. Asset de imagem com fundo transparente em alta resolução, aprovado.
3. Copy narrativo por estágio, aprovado.
4. Decisão explícita: CDN agora vs. esperar bundler da Fase 2.
5. Validação de que o efeito não derruba os scores atuais de Lighthouse (performance/acessibilidade).
6. Aprovação visual prévia (mockup/storyboard) do efeito antes de qualquer código, conforme regra de modernização visual do projeto (`docs/DESIGN-SYSTEM.md`, seção "Governança").
