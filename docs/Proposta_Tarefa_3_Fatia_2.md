# Proposta — Tarefa 3, Fatia 2: migrar `SiteHeader` e `SiteFooter` para Next.js

Status: APROVADA — AGUARDANDO IMPLEMENTAÇÃO (executor designado: Codex; nenhum código foi criado ou alterado por esta proposta)
Data: 28/08/2026 (revisão 2 — aprovada)
Escopo autorizado: Tarefa 3 (Incrementos 2–8, `tasks/plan.md`/`tasks/todo.md`), restrito nesta fatia ao Incremento 2 (SiteHeader/SiteFooter)
Savepoint confirmado: commit `3fc687c` ("feat: adicionar WhatsAppDialog e provider compartilhado (Tarefa 3.1)")

## 0.1 Decisões aprovadas e correção aplicada nesta revisão

Jose aprovou **D1, D2, D3 e D4** (seção 7 da revisão anterior) sem ressalvas — tratadas como confirmadas no restante deste documento.

Jose determinou uma **correção obrigatória** na revisão anterior: o `SiteFooter` havia sido proposto com conteúdo reduzido a uma única linha de copyright, removendo marca, descrição, contatos, redes sociais e o CTA de WhatsApp do rodapé. Isso não era o pedido original — a instrução era não usar selo/ícone/texto sobre uso de IA no rodapé, não remover o restante do conteúdo. Correção aplicada: o `SiteFooter` agora preserva integralmente a estrutura e o conteúdo do rodapé do baseline (marca, descrição, Endereço, Contato com CTA de WhatsApp, Redes sociais, e a linha final). A única alteração de conteúdo aprovada é a linha final do `footer-bottom`, que passa de `© <span id="year"></span> FortSul. Todos os direitos reservados.` (dinâmica, via `script.js`) para o texto estático `© 2026 FortSulSC. Todos os direitos reservados.` — sem selo, ícone ou referência a uso de IA. Isso reverte as seções 3.3, 4, 5 (contrato de `SiteFooter`) e os riscos R2/R3 da revisão anterior, detalhados abaixo com o conteúdo corrigido.

## 0. Estado do repositório e fontes consultadas

`git status --short` no momento desta proposta:

```text
 M CLAUDE.md
 M docs/FortSulSC_instrucoes_Hermes_Codex.md
?? .agents/
?? .mcp.json
?? docs/CODEBASE_MAP.md
?? skills-lock.json
```

Essas alterações são resíduo do setup de automação (subagentes/hooks/skills) aprovado anteriormente nesta sessão — não pertencem a esta proposta e não foram tocadas.

Documentos lidos antes de redigir esta proposta: `docs/PLANO_MESTRE_FORTSULSC.md`, `docs/PLANEJAMENTO_PROJETO.md`, `docs/RULES.md`, `docs/COMPONENTS.md` (§3.1 SiteHeader, §3.11 SiteFooter), `docs/DESIGN-SYSTEM.md`, `docs/CHECKLIST.md`, `docs/FortSulSC_instrucoes_Hermes_Codex.md`, `tasks/plan.md`, `tasks/todo.md`, além do baseline (`index.html`, `styles.css`, `script.js`) e do código Next.js já commitado (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/components/whatsapp/*`).

Skills aplicáveis declarados: `using-agent-skills` (fluxo), `incremental-implementation`/vertical slicing (Fatia 2 dentro da Tarefa 3), `test-driven-development` (contrato de testes descrito nesta proposta, código de teste só é escrito na implementação — Fase 2 do projeto ainda não exige testes versionados como pré-condição de proposta, conforme `docs/PLANEJAMENTO_PROJETO.md`), `frontend-design`/design-system adherence.

Context7 consultado (`/vercel/next.js/v16.1.6`) para dois pontos que fundamentam esta proposta:

- `next/image`: `width`/`height` são obrigatórios para imagem local referenciada por caminho de string (não há import estático), a menos que se use `fill`. Fonte: `docs/01-app/03-api-reference/02-components/image.mdx`.
- Composição Server/Client: o padrão recomendado para renderizar conteúdo de Server Component dentro de um Client Component interativo é passar esse conteúdo via prop `children` ("slot"), mantendo o Client Component o menor possível. Fonte: `docs/01-app/01-getting-started/05-server-and-client-components.mdx`. Também confirmado: props passadas para Client Components precisam ser serializáveis.

## 1. Objetivo, escopo incluído e exclusões

**Objetivo:** migrar o cabeçalho (`<header>`) e o rodapé (`<footer>`) do baseline estático para componentes Next.js (`SiteHeader`, `SiteFooter`), preservando paridade visual e comportamental de ambos (barra utilitária, navegação, menu mobile, CTA de WhatsApp, header sticky, marca/descrição/endereço/contato/redes sociais do rodapé) e trocando apenas a linha final de copyright do rodapé pelo texto estático definido por Jose.

**Incluído nesta fatia:**

- `SiteHeader` (Server Component) com barra utilitária, marca, navegação principal e CTA de WhatsApp.
- Menu mobile como Client Component isolado (toggle, `aria-expanded`, fechamento ao clicar em link, fechamento ao redimensionar acima do breakpoint).
- Comportamento sticky do header (Client Component isolado) replicando a lógica atual de `script.js`.
- `SiteFooter` (Server Component), com o conteúdo completo do rodapé do baseline preservado e só a linha final de copyright alterada.
- CSS base de cabeçalho/rodapé/menu, migrado de `styles.css` para `src/app/globals.css`.
- Reestruturação de `src/app/layout.tsx`/`src/app/page.tsx` para hospedar `SiteHeader`/`SiteFooter` e resolver o provedor único de WhatsApp (ver seção 2 e risco R1).

**Explicitamente fora de escopo (não implementado nesta fatia):**

- `index.html`, `styles.css`, `script.js`, `image/` — preservados byte a byte, sem qualquer edição.
- Página de produto, 404, API, banco de dados, Docker, admin, autenticação — fora de escopo do projeto nesta fase (CLAUDE.md §2/§13).
- CSS de `.product-*` e `.not-found` — não portado.
- Página/rota de política de privacidade — não criada (o baseline não tem nenhum link para ela; nada a preservar).
- Decisão sobre Blog/"Conteúdos técnicos" no menu e sobre criar rota de Revendas — não tomada agora; o menu mantém exatamente os itens atuais do baseline.
- Seções de Home (Hero, Categorias, Sobre, Soluções, Atendimento, Presença, CTA final) — Incrementos 3–8, fora desta fatia.
- Testes automatizados em código e implementação de componentes — só ocorrem após aprovação desta proposta (ver seção 7).

## 2. Arquivos a serem criados ou modificados

| Arquivo | Ação | Motivo |
|---|---|---|
| `src/components/layout/SiteHeader.tsx` | criar | Server Component: barra utilitária, marca, `<nav>` principal, CTA |
| `src/components/layout/NavWrap.tsx` | criar | Client Component: aplica `is-sticky` ao rolar, envolve `nav-inner` (recebe conteúdo Server via `children`) |
| `src/components/layout/MobileMenu.tsx` | criar | Client Component: botão hambúrguer + `<nav id="main-nav">`, controla `aria-expanded`, classe `is-open`, fecha ao clicar em link e ao redimensionar |
| `src/components/layout/SiteFooter.tsx` | criar | Server Component: rodapé completo do baseline (marca, endereço, contato, redes sociais) + linha de copyright estática |
| `src/components/layout/SiteHeader.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/components/layout/MobileMenu.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/components/layout/SiteFooter.test.tsx` | criar (na implementação) | contrato descrito na seção 5 |
| `src/app/globals.css` | modificar | adicionar seção `/* ===== Fatia 2 — SiteHeader e SiteFooter ===== */` (ver seção 4) |
| `src/app/layout.tsx` | modificar | inserir `SiteHeader`/`SiteFooter`; mover `WhatsAppProvider`/`FloatingWhatsApp` de `page.tsx` para cá (ver risco R1) |
| `src/app/page.tsx` | modificar | remover `WhatsAppProvider`/`FloatingWhatsApp`/botão de teste duplicados, já que passam a viver em `layout.tsx` |
| `docs/COMPONENTS.md` | modificar | marcar `SiteHeader`/`SiteFooter`/`MobileMenu` como implementados, com props reais |
| `tasks/plan.md` / `tasks/todo.md` | modificar | marcar Incremento 2 como concluído, após aprovação e commit |

Nenhum arquivo do baseline estático (`index.html`, `styles.css`, `script.js`, `image/`) é criado, modificado ou removido.

## 3. Estrutura e responsabilidades

### 3.1 `SiteHeader` (Server Component)

Renderiza, na ordem do baseline (`index.html` linhas 1–90):

1. `.utility-bar` — telefone e e-mail de contato (texto estático, sem lógica).
2. `.nav-wrap` — delegado ao Client Component `NavWrap`, que só existe para alternar a classe `is-sticky` conforme o scroll; recebe todo o conteúdo (`brand`, `MobileMenu`, CTA) como `children` renderizado no servidor (padrão "slot" confirmado no Context7).
3. Dentro do `nav-inner`: link da marca (`<a className="brand" href="/" aria-label="FortSul — início">` com `<Image src="/image/cropped-Logo.webp" width={301} height={67} alt="FortSul Equipamentos Agrícolas" priority />` — `aria-label` e `alt` copiados literalmente do baseline, linha 32–33 de `index.html`), `MobileMenu` (Client, contém o botão hambúrguer e o `<nav id="main-nav">` com os 5 itens atuais do baseline, sem alteração de conteúdo) e o CTA de WhatsApp.
4. O CTA de WhatsApp (`.nav-cta`) é renderizado como `<WhatsAppTrigger className="button nav-cta" ariaLabel="Solicitar orçamento por WhatsApp">Solicitar orçamento</WhatsAppTrigger>` — reaproveita o Client Component já criado na Fatia 1, sem duplicar lógica de diálogo.

`SiteHeader` não guarda estado; toda interação (sticky, menu mobile, diálogo do WhatsApp) fica isolada nos três Client Components (`NavWrap`, `MobileMenu`, `WhatsAppTrigger`), mantendo o restante do cabeçalho como Server Component, conforme o padrão de composição confirmado no Context7.

### 3.2 Menu mobile (`MobileMenu`, Client Component)

Réplica funcional da lógica atual em `script.js` (linhas do bloco de menu):

- Estado local `isOpen` (`useState`); botão `.menu-toggle` com `aria-expanded={isOpen}`, `aria-controls="main-nav"` e rótulo acessível que alterna entre "Abrir menu" e "Fechar menu" (`sr-only`).
- `<nav id="main-nav" aria-label="Menu principal">` recebe a classe `is-open` quando `isOpen === true` (mesma classe do baseline, mesmo CSS).
- Clique em qualquer link do menu fecha o menu (paridade com o baseline).
- `useEffect` com listener de `resize`: fecha o menu automaticamente acima de 820px (mesmo limiar do baseline), com cleanup no unmount.
- `useEffect` que alterna `document.body.classList.add/remove('menu-open')` conforme `isOpen` — a regra CSS `body.menu-open { overflow: hidden }` já existe em `globals.css` desde a Tarefa 1B; esta fatia só passa a acioná-la.
- Navegação por teclado: como o toggle é um `<button>` nativo e os itens são `<a>` nativos, `Tab`/`Shift+Tab` e `Enter`/`Espaço` funcionam sem handlers customizados — nenhuma "armadilha de foco" é necessária aqui (diferente do `WhatsAppDialog`, que é um diálogo modal; o menu mobile é um painel de navegação, não modal).
- **Fechar com Esc (D1 — aprovado):** o baseline atual não fecha o menu mobile com Esc (script.js só fecha via novo clique no toggle, clique em link, ou resize). Jose aprovou adicionar esse comportamento nesta fatia, por consistência de acessibilidade com o `WhatsAppDialog` (mesma tecla, mesma expectativa do usuário). `Esc` fecha o menu quando aberto e devolve o foco ao botão de toggle.

### 3.3 `SiteFooter` (Server Component, corrigido nesta revisão)

Preserva integralmente a estrutura e o conteúdo do rodapé do baseline (`index.html` linhas 308–319): `footer-grid` com 4 blocos (marca/descrição, Endereço, Contato, Redes sociais) e `footer-bottom`. A única mudança de conteúdo é a linha final, que passa a ser estática (sem depender de JS) e usa "FortSulSC" em vez de "FortSul":

```tsx
<footer className="site-footer">
  <div className="container footer-grid">
    <div className="footer-brand">
      <a href="/">
        <Image
          src="/image/cropped-Logo.webp"
          width={301}
          height={67}
          alt="FortSul Equipamentos Agrícolas"
        />
      </a>
      <p>Tecnologia para uma produção ainda mais eficiente.</p>
    </div>
    <div>
      <h3>Endereço</h3>
      <p>Estrada Geral Furninhas — Interior<br />Orleans — SC, 88870-000</p>
    </div>
    <div>
      <h3>Contato</h3>
      <a href="tel:+554836600818">(48) 3660-0818</a>
      <WhatsAppTrigger className="whatsapp-trigger" ariaLabel="Atendimento via WhatsApp">
        Atendimento via WhatsApp
      </WhatsAppTrigger>
    </div>
    <div>
      <h3>Redes sociais</h3>
      <a href="https://www.instagram.com/fortsulsc.ols/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
      <a href="https://www.facebook.com/fortsulsc.ols" target="_blank" rel="noopener noreferrer">Facebook ↗</a>
      <a href="https://www.youtube.com/channel/UCWdoH4BuVLX--mdu_598MXA" target="_blank" rel="noopener noreferrer">YouTube ↗</a>
    </div>
  </div>
  <div className="container footer-bottom">
    <span>© 2026 FortSulSC. Todos os direitos reservados.</span>
    <a href="#inicio">Voltar ao topo ↑</a>
  </div>
</footer>
```

Notas sobre a fidelidade ao baseline:

- **Marca/descrição, Endereço, Redes sociais:** portados literalmente — mesmo texto, mesmos links, mesma ordem.
- **CTA de WhatsApp:** o baseline usa `<a class="whatsapp-trigger" href="#whatsapp-dialog" data-whatsapp-trigger>`, que é um hook em JavaScript puro sem nenhuma regra CSS própria (confirmado: `.whatsapp-trigger` não tem nenhuma declaração em `styles.css`). Nesta migração, esse CTA é substituído pelo `WhatsAppTrigger` Client já criado na Fatia 1 — mesma abordagem usada no CTA do header (seção 3.1) — preservando o texto visível "Atendimento via WhatsApp" e a função (abrir o diálogo de WhatsApp).
- **Botão flutuante e diálogo de WhatsApp** (`.whatsapp-float`, `<dialog class="whatsapp-dialog">`, linhas 321–337 do baseline) não fazem parte de `<footer>` no HTML de origem — são irmãos do `<footer>`, já cobertos por `FloatingWhatsApp`/`WhatsAppProvider` da Fatia 1, que passam a viver em `layout.tsx` (D3). `SiteFooter` não duplica esses elementos.
- **"Navegação":** o rodapé do baseline não tem um bloco de menu/sitemap separado dos 4 blocos do `footer-grid`; a única "navegação" presente no rodapé é o link "Voltar ao topo ↑" em `footer-bottom`, preservado.
- **Linha final (única alteração de conteúdo aprovada):** de `© <span id="year"></span> FortSul. Todos os direitos reservados.` (ano calculado em `script.js`, não portado) para `© 2026 FortSulSC. Todos os direitos reservados.` (texto estático) — sem selo, ícone ou menção a uso de IA, conforme instrução. Ver risco R4 sobre o ano fixo.
- **Endereço físico:** já é dado público no baseline (endereço comercial da empresa, não coordenada de pessoa física) — preservá-lo aqui não introduz nova exposição de dado sensível (CLAUDE.md §13/§14).

## 4. Estratégia de migração de CSS (vs. baseline)

CSS é adicionado como uma nova seção em `src/app/globals.css` (mesma convenção das seções `Base` e `Fatia 1 — WhatsApp` já presentes), migrando **apenas** os seletores de cabeçalho/menu/rodapé de `styles.css`. Nada de `.hero*`, `.category-*`, `.about-*`, `.solutions*`, `.support*`, `.presence*`, `.cta-section`, `.content-*`, `.product-*` ou `.not-found*` é portado nesta fatia.

**Portado verbatim:** `.utility-bar`, `.utility-inner`, `.utility-inner > div`, `.utility-inner a:hover`, `.utility-divider`, `.nav-wrap`, `.nav-wrap.is-sticky`, `.nav-inner`, `.brand img` (todas as variantes responsivas: base 210px, 1050px→185px, 820px→185px, 560px→166px), `.main-nav`, `.main-nav a`, `.main-nav a::after`, `.main-nav a:hover::after, .main-nav a:focus-visible::after`, `.menu-toggle`, `.menu-toggle > span:not(.sr-only)`, `@keyframes slideDown`, e os blocos `@media` relevantes em 1050px e 820px (segundo bloco — o de layout do header/menu, não o de `.product-*`) para `.nav-inner`, `.brand img`, `.main-nav` (inclusive versão fixa/painel mobile e `.main-nav.is-open`), `.main-nav a`, `.menu-toggle` (`display:block`, estados `[aria-expanded="true"]` dos 3 `<span>`), `.nav-cta` (`display:none` acima de 820px definido só nas media queries, sem regra base — confirmado no baseline).

**Portado verbatim (rodapé, corrigido nesta revisão — conteúdo completo preservado, ver seção 3.3):** `.site-footer` (padding-top, background, color), `.footer-grid` (grid de 4 colunas), `.footer-brand img` (210px), `.footer-brand p`, `.footer-grid h3`, `.footer-grid > div > a` e `:hover`, `.footer-grid p`, `.footer-bottom` (`justify-content: space-between` entre copyright e "Voltar ao topo", inalterado — a correção desta revisão elimina a necessidade de adaptar esta regra), `.footer-bottom a:hover`, e os overrides responsivos `.footer-grid { grid-template-columns: 1.5fr 1fr }` (820px) e `.footer-grid { grid-template-columns: 1fr; gap: 32px }` / `.footer-bottom { min-height:100px; flex-direction:column; ... }` (560px).

**Explicitamente não portado:** nada do rodapé fica de fora nesta revisão — todo o CSS de `.footer-*` do baseline é migrado, pois todo o conteúdo correspondente é preservado.

**Observação incidental (D2 — aprovado):** ao portar os tokens `--container`/`--radius` do breakpoint 560px (camada de CSS base), o `.whatsapp-dialog` (já commitado na Fatia 1) passa a herdar `--radius: 14px` em telas ≤560px, igual ao baseline — hoje ele usa `--radius: 18px` fixo em todas as larguras, uma pequena divergência pré-existente da Fatia 1. Jose aprovou incluir esses dois tokens agora, corrigindo essa divergência como efeito colateral da migração de CSS base.

`next/image` para a logo (`public/image/cropped-Logo.webp`) usa dimensões reais verificadas via parsing do header VP8X do WebP (não há ImageMagick/PIL/exiftool disponíveis no ambiente): **301×67px** — `width={301} height={67}`. Esta é a primeira utilização de `next/image` no projeto; não há padrão prévio para seguir além da documentação oficial já citada na seção 0.

## 5. Contrato de testes proposto

Seguindo o padrão já usado em `whatsapp-flow.test.tsx` (Vitest + Testing Library + `user-event`, nomes em português). Código de teste será escrito durante a implementação (RED antes do GREEN); esta seção descreve o contrato a implementar.

**`MobileMenu.test.tsx`**
1. Estado inicial: botão com `aria-expanded="false"`; `<nav id="main-nav">` presente, sem a classe `is-open`.
2. Clique no botão abre o menu: `aria-expanded="true"`, `nav` recebe `is-open`, rótulo acessível muda para "Fechar menu".
3. Clique em um link do menu fecha o menu (`aria-expanded` volta a `"false"`).
4. Ativação por teclado: `Tab` até o botão + `Enter` (via `userEvent.keyboard`) abre o menu — prova de operabilidade por teclado, não só por clique de mouse.
5. Foco visível: botão e links do menu são elementos nativos (`<button>`/`<a>`), portanto focáveis e com contorno de foco do CSS já migrado (`:focus-visible`); teste verifica que são expostos pelas roles corretas (`getByRole('button')`, `getByRole('link')`), não `<div>` com `onClick`.
6. `Escape` fecha o menu quando aberto e devolve o foco ao botão de toggle (D1 — aprovado).

**`SiteHeader.test.tsx`** (renderizado dentro de `<WhatsAppProvider>`, como em `whatsapp-flow.test.tsx`)
1. Renderização básica: barra utilitária com telefone/e-mail, marca com link para `/`, os itens de navegação atuais do baseline, CTA "Solicitar orçamento".
2. Clique no CTA do header abre o `WhatsAppDialog` (reaproveitando o `WhatsAppTrigger` da Fatia 1), com foco inicial no botão de fechar do diálogo — reconfirma a integração em um novo consumidor do trigger compartilhado.
3. Marcos semânticos: `<header>` expõe role `banner`; `<nav aria-label="Menu principal">` expõe role `navigation`.

**`SiteFooter.test.tsx`** (renderizado dentro de `<WhatsAppProvider>`, mesmo motivo do `SiteHeader`)
1. Renderiza `<footer>` (role `contentinfo`) com os 4 blocos do `footer-grid`: marca (link + imagem com `alt` correto) e descrição; "Endereço" com o texto completo; "Contato" com telefone (`tel:+554836600818`) e o CTA "Atendimento via WhatsApp"; "Redes sociais" com os 3 links (Instagram/Facebook/YouTube) com `target="_blank"` e `rel="noopener noreferrer"`.
2. `footer-bottom` contém exatamente o texto `© 2026 FortSulSC. Todos os direitos reservados.` (estático, sem `id="year"`) e o link "Voltar ao topo ↑" apontando para `#inicio`.
3. Clique no CTA "Atendimento via WhatsApp" do rodapé abre o `WhatsAppDialog` — mesma verificação de integração feita para o CTA do header (seção 5, `SiteHeader.test.tsx`), confirmando que os dois CTAs (header e footer) compartilham o mesmo `WhatsAppProvider` sem abrir diálogos concorrentes.

**Fora do contrato automatizado (jsdom não calcula layout real):** o comportamento sticky do `NavWrap` (baseado em `offsetTop`/`offsetHeight`/`scrollY`) recebe apenas um teste de fumaça (monta sem erro, sem `is-sticky` no estado inicial); a validação de scroll real é manual, no navegador (seção 6).

## 6. Validações automatizadas e manuais

**Automatizadas:**
- `npm run typecheck` — sem erro.
- `npm run test:unit` (Vitest) — os três arquivos de teste da seção 5, mais a suíte já existente de `whatsapp-flow.test.tsx` continuando verde (garante que mover o provedor para `layout.tsx` não quebra o fluxo já aprovado).
- `npm run build` — sem erro.
- `npm test` (suíte do preview estático) — verde, já que o baseline não é tocado.

**Manuais (Jose, antes da aprovação final):**
- Comparação visual lado a lado com `index.html` em três larguras: desktop, ~820px, ~560px/375px — cabeçalho, menu mobile aberto/fechado, CTA, rodapé.
- Passagem só de teclado: `Tab` por toda a navegação, `Enter`/`Espaço` no toggle do menu, `Esc` para fechar o menu mobile, abertura do diálogo de WhatsApp pelos CTAs do header e do rodapé.
- Scroll da página para validar o efeito sticky do header (`is-sticky`), já que não é coberto por teste automatizado.
- `prefers-reduced-motion` ativo no SO/navegador: confirmar que a transição do menu mobile e do header sticky respeita a preferência (mesma regra global já migrada na Fatia 1).
- Opcional/recomendado (agora que existem componentes consumidores, ao contrário da Tarefa 2 que adiou por não ter nenhum): Lighthouse de acessibilidade na página com `SiteHeader`/`SiteFooter`.

## 7. Riscos, decisões pendentes e proposta de commit atômico

**Riscos:**
- **R1:** mover `WhatsAppProvider`/`FloatingWhatsApp` de `page.tsx` para `layout.tsx` é uma mudança estrutural — precisa garantir que não existam dois diálogos concorrentes e que `whatsapp-flow.test.tsx` continue passando sem alteração no seu próprio arranjo de teste. Com o rodapé agora tendo seu próprio CTA de WhatsApp (além do header), esse risco cresce ligeiramente: dois consumidores independentes do mesmo `WhatsAppTrigger`/`WhatsAppProvider` precisam abrir o mesmo diálogo único, nunca instâncias duplicadas — coberto pelo item 3 do contrato de teste do `SiteFooter` (seção 5).
- **R4:** ano fixo "2026" no rodapé, em vez do `<span id="year">` dinâmico do baseline — ficará desatualizado em 2027 sem nova alteração; decisão explícita de Jose nesta tarefa, registrada aqui para revisão futura.
- **R5:** o comportamento sticky do header, por depender de layout real do navegador, tem cobertura automatizada mínima (seção 5); regressões nesse ponto só são detectadas na validação manual.

*(R2 e R3 da revisão anterior — remoção de conteúdo do rodapé e troca de marca "FortSul"→"FortSulSC" no rodapé inteiro — não se aplicam mais: a correção desta revisão preserva o conteúdo completo do rodapé; a marca visual/`alt` do logo continua "FortSul Equipamentos Agrícolas", igual ao baseline; só a linha final de copyright usa "FortSulSC", por instrução explícita de Jose.)*

**Decisões — todas aprovadas nesta revisão:**
- **D1 (aprovado):** o menu mobile fecha com `Esc`, devolvendo o foco ao botão de toggle.
- **D2 (aprovado):** os tokens responsivos `--container`/`--radius` do breakpoint 560px são portados agora, corrigindo como efeito colateral o `border-radius` do `WhatsAppDialog` em telas pequenas.
- **D3 (aprovado):** reestruturação de `layout.tsx`/`page.tsx` conforme seção 2, movendo `WhatsAppProvider`/`FloatingWhatsApp` para o layout.
- **D4 (aprovado):** nomes de arquivo/componente confirmados — `SiteHeader`, `SiteFooter`, `MobileMenu`, `NavWrap`.

**Proposta de commit atômico** (só após testes, validação manual e aprovação dupla, conforme seção 6.2 do contrato operacional):

```text
feat: migrar SiteHeader e SiteFooter para Next.js (Tarefa 3 — Fatia 2)
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
- Decisões D1–D4 (seção 7): APROVADAS por Jose.
- Correção do SiteFooter (seção 0.1/3.3): aplicada e aprovada — conteúdo completo
  do baseline preservado, só a linha final de copyright é estática/"FortSulSC".
- Riscos R1, R4, R5 (seção 7) para acompanhamento durante e após a implementação.
- Implementação delegada a Codex — Codex deve seguir o contrato operacional
  (`docs/FortSulSC_instrucoes_Hermes_Codex.md`) e entregar no formato de saída
  ali definido (seção 10) para nova revisão do Claude antes de commit/push.

FORA DO ESCOPO
- Baseline estático, produto/404/API/banco/Docker/admin, CSS de .product-*/.not-found,
  rota de política de privacidade, decisão sobre Blog/Revendas no menu — ver seção 1.

DOCUMENTAÇÃO E SECOND BRAIN
- Decisão de aprovação (correção do rodapé + D1–D4) a registrar no Second Brain
  (30-Decisoes/) por quem executar o protocolo global antes/durante a implementação.
```
