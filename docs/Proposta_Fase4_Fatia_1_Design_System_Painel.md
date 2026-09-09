# Proposta técnica — Fase 4, Fatia 1 (estilo visual do painel administrativo)

**Status:** implementada e aprovada por Jose em 09/09/2026. Ver seção 5 (decisões finais e resultado).

## 0. Por que esta proposta existe antes de qualquer implementação

Jose pediu no chat para integrar um componente de dashboard pronto (`dashboard-with-collapsible-sidebar.tsx`, vindo de um gerador externo estilo v0/21st.dev, com shadcn/Tailwind/lucide-react) e usar uma captura de tela (`painel.png`, um cliente de e-mail estilo Mailbird com sidebar de ícones verde-água) como referência de estilo para o painel administrativo do FortSulSC.

Isso é, na prática, a primeira fatia da **Fase 4 — Painel administrativo**. `docs/PLANO_MESTRE_FORTSULSC.md` (linha 337-338) registra, com data de 08/09/2026:

> "Nenhuma fatia desta fase começa sem proposta técnica e aprovação explícita de Jose, seguindo o mesmo fluxo usado na Fase 3."

Por isso não copiei o componente nem instalei Tailwind/shadcn/lucide-react ainda — isso seria pular a etapa de aprovação que o próprio Jose formalizou ontem. Esta proposta é o primeiro passo desse fluxo (proposta técnica → aprovação do Jose → revisão do Claude → implementação/smoke tests → validação manual → aprovação dupla → commit).

## 1. Estado real encontrado no código

- **Sem Tailwind CSS, sem shadcn/ui, sem `components.json`, sem `lucide-react`** — confirmado em `package.json` e na ausência de `tailwind.config.*`/`postcss.config.*`.
- Estilo atual é 100% CSS global (`src/app/globals.css`, 396 linhas) com tokens institucionais já aprovados (`docs/DESIGN-SYSTEM.md`):
  - `--blue-950/900/800/700` (azul institucional), `--orange`/`--orange-light` (CTA), `--ink`, `--muted`, `--surface`, `--radius: 18px`, `--shadow`.
  - Sem CSS Modules, sem CSS-in-JS: classes globais tipo BEM (`admin-login`, `admin-login-card`, etc.).
- `src/app/admin/layout.tsx` existe mas é um shell vazio (`<div className="admin-shell">`). `src/app/admin/login` é a única tela funcional do painel (login + MFA). **Não existe ainda nenhuma tela pós-login/dashboard.**
- `src/components/ui/` só tem `Reveal.tsx` (animação de entrada), não é uma pasta shadcn (`/components/ui` no sentido do CLI shadcn, que gera primitivos tipo `button.tsx`, `card.tsx`).

## 2. O que o componente colado traz, e por que não bate direto com o projeto

O `dashboard-with-collapsible-sidebar.tsx` fornecido:

- Usa paleta genérica do Tailwind (`blue-500/600`, `gray-50...950`), não os tokens FortSulSC.
- Assume Tailwind + `dark:` classes + toggle de dark mode via classe `dark` no `<html>` — o projeto hoje não tem dark mode.
- Usa `lucide-react` para todos os ícones do menu (Home, DollarSign, ShoppingCart, etc. — nenhum faz sentido para o domínio da FortSulSC: produtos agrícolas, representantes, revendas, regiões, banners).
- Dados 100% fake/hardcoded (vendas, usuários, produtos, atividades) — coerente com "design/frontend primeiro" do `CLAUDE.md` §1, mas precisa ficar claramente marcado como mock, não como tela real conectada a dado.

A imagem `painel.png` (cliente de e-mail) tem uma ideia de layout aproveitável — sidebar compacta de ícones, área de conteúdo em cards brancos, tema claro — mas também usa paleta fora do padrão (verde-água) e é de um domínio diferente (inbox de e-mail).

`docs/DESIGN-SYSTEM.md` §1 é explícito: **"Não alterar drasticamente a linguagem visual sem apresentar antes ao Jose."** Um dashboard azul/cinza genérico do Tailwind, sem adaptação, seria exatamente essa alteração drástica.

## 3. Decisões que só o Jose pode tomar antes de eu implementar qualquer coisa

1. **Tailwind CSS + shadcn/ui agora, ou continuar em CSS puro?**
   O `CLAUDE.md` §4 já lista Tailwind + shadcn/ui como "stack futura planejada" — a Fase 4 pode ser o momento certo de introduzi-los, mas isso significa o painel administrativo passar a ter uma linguagem de estilo **diferente** do site público (que continua em CSS puro). Duas opções:
   - **(a) Tailwind só dentro de `src/app/admin/**`** — isolado, não mexe no CSS do site público, mas o projeto passa a manter dois sistemas de estilo em paralelo.
   - **(b) Continuar 100% em CSS puro**, portando a estrutura/layout do componente colado (sidebar colapsável, cards de estatística, grid de atividade) para classes novas em `globals.css` (ou um `admin.css` dedicado), usando os tokens já aprovados. Mais consistente com o que existe, sem nova ferramenta de build.
   - Minha recomendação técnica, sem decidir por você: **(b)**, para não duplicar sistema de estilo por um único conjunto de telas. Tailwind/shadcn continuam viáveis mais adiante se você quiser adotá-los no projeto inteiro de uma vez, não só no admin.

2. **`lucide-react` isolado, independente da decisão acima?**
   É só uma biblioteca de ícones SVG em React, funciona com ou sem Tailwind, é leve e não conflita com o CSS existente. Proponho instalá-la de qualquer forma (baixo risco, não é uma mudança estrutural pesada) — mas ainda depende da sua aprovação por ser dependência nova.

3. **Paleta**: os cards, sidebar e gráficos devem seguir os tokens institucionais (azul `#061b42`/`#0a3478` + laranja `#f26a21` como destaque), e não o azul/cinza genérico do componente colado nem o verde-água do `painel.png`. Confirma?

4. **Escopo desta primeira fatia**: uma tela **estática de referência visual**, com dados fake e explicitamente fora do fluxo de login real (ex.: `/admin/preview-dashboard`, sem sessão/RBAC), só para você validar o estilo antes de virar a home real pós-login — ou já deve nascer como a tela que aparece depois do MFA em `/admin`? Recomendo a primeira opção: menor risco, não mexe em rota autenticada, mais fácil de iterar no visual antes de comprometer a estrutura real do painel.

5. **Ícones do menu**: o componente colado traz itens de e-commerce genérico (Sales, Products, Tags). Para a FortSulSC faria mais sentido: Dashboard, Produtos, Categorias, Representantes, Revendas, Regiões, Banners, Configurações — alinhado ao objetivo da Fase 4 (`PLANO_MESTRE_FORTSULSC.md` linha 332). Confirma essa lista ou quer ajustar?

## 4. O que acontece depois da sua resposta

Com as decisões acima, eu:

1. Atualizo esta proposta com o escopo final fechado (mesmo padrão das fatias da Fase 3);
2. Só então crio o(s) arquivo(s) — sem tocar em rota autenticada, sem CRUD, sem dado real;
3. Rodo `lint`, `typecheck`, `test:static`/`test:unit` e `next build`;
4. Delego ao subagente `ui-reviewer` (acessibilidade, responsividade, aderência ao design system) antes de te entregar para validação visual;
5. Só depois da sua validação manual e aprovação dupla, o commit acontece — feito por você, não por mim (`CLAUDE.md` §10).

## 5. Decisões finais e resultado (09/09/2026)

Jose decidiu: **(a)** Tailwind CSS v4 + `lucide-react`, isolados a `src/app/admin/**`; tela **estática de referência** em `/admin/preview-dashboard` (fora do login/sessão real); paleta institucional (não a genérica do componente colado nem o verde-água do `painel.png`); lista de ícones do menu conforme sugerida na seção 3.5; logotipo do sidebar trocado depois, a pedido do Jose, do wordmark grande (`/image/cropped-Logo.webp`) para o ícone compacto (`/public/icon.png`).

Implementado na worktree `claude-fase4-painel-base` (branch `feature/claude-fase4-painel-base`):

- `postcss.config.mjs` (novo, raiz do projeto): plugin `@tailwindcss/postcss`. Só processa arquivos que usam `@import "tailwindcss"` — `src/app/globals.css` (site público) não usa essa diretiva e não é afetado.
- `src/app/admin/preview-dashboard/admin-tailwind.css`: tema Tailwind com os tokens institucionais reexpostos (`--color-brand-blue-950/900/800`, `--color-brand-orange/-light/-dark`, `--color-brand-ink/-muted/-surface/-line`, `--radius-brand: 18px`, `--font-brand-sans`), importado só nesta página.
- `src/components/admin-preview/` — `PreviewDashboardShell.tsx`, `PreviewSidebar.tsx` (sidebar colapsável, ícone-só forçado abaixo do breakpoint `md` independente do estado do toggle), `PreviewDashboardOverview.tsx` (cards de estatística, atividade recente, progresso por categoria real do catálogo), `preview-data.ts` (dado 100% fictício).
- Dependências novas: `lucide-react`, `tailwindcss` + `@tailwindcss/postcss` (dev).

Revisão do `ui-reviewer`: 2 achados bloqueantes corrigidos antes da entrega — (1) botões de navegação sem nome acessível quando o rótulo de texto fica oculto (mobile/sidebar recolhida) — corrigido com `aria-label` sempre presente no botão; (2) landmark `<main id="conteudo">` ausente, quebrando o skip-link global — corrigido. Ajustes não bloqueantes também aplicados: contraste do badge numérico, token de cor de borda (`--color-brand-line`) e de fonte (`--font-brand-sans`) mapeados no tema em vez de valores ad-hoc.

`lint`, `lint:types`, `typecheck`, `test:static`, `test:unit` (35 arquivos/109 testes, sem regressão no site público) e `next build` aprovados. Sem teste automatizado dedicado a esta tela (é referência visual estática, sem regra de negócio) — validação foi visual/manual (desktop e mobile) via navegador.

Commit, merge e push continuam pendentes — feitos por Jose, não pelo agente.
