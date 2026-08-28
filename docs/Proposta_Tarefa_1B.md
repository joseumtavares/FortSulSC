# Proposta — Tarefa 1B: Estrutura mínima do App Router

Status: IMPLEMENTADA — AGUARDANDO APROVAÇÃO DUPLA/COMMIT
Data: 27/08/2026
Escopo autorizado: somente Tarefa 1B, conforme `tasks/plan.md` e `tasks/todo.md`
Savepoint confirmado: commit `57a414f` ("feat: configurar fundação Next.js e TypeScript (Tarefa 1A)")

> Este documento nasceu como proposta (nenhum arquivo de código criado ou editado para produzi-la). Após aprovação do Jose e revisão técnica do Claude, a implementação foi realizada exatamente conforme a seção 4, mais o ajuste registrado no adendo (seção 11). Falta só a aprovação dupla final para o commit — ver seção 11.

---

## 0. Verificação do estado do repositório

```
$ git log --oneline -5
57a414f feat: configurar fundação Next.js e TypeScript (Tarefa 1A)   ← savepoint confirmado
0d92271 docs: aprovar proposta da Tarefa 1A — fundação Next.js e TypeScript
4833f97 chore: ignorar configuracoes locais e logs de preview
2e82148 docs: registrar backlog da animação do Bioqueimador de Cavaco no Plano Mestre
abcb185 fix: corrigir contraste WCAG e acabamento de acessibilidade no frontend estático

$ git status --short
?? .agents/
?? skills-lock.json
```

Working tree limpo, exatamente como o checkpoint exige (só as duas exceções já previstas em `tasks/plan.md`). Não existe `src/` nem `app/` na raiz do projeto.

Node.js local verificado: `v22.23.2` (acima do mínimo exigido, `>=20.9.0`). Next.js instalado: `16.3.3` (dentro do range `^16.2.9` fixado na Tarefa 1A). TypeScript instalado: `5.9.3` (dentro do range `^5`).

---

## 1. Skills aplicadas

| Skill | Por quê |
|---|---|
| `using-agent-skills` | Ponto de entrada obrigatório desta sessão. |
| `incremental-implementation` | Tarefa 1B é uma fatia pequena e aditiva: só cria a estrutura mínima do App Router, sem migrar o design real da home (isso é a Tarefa 3, já aprovada separadamente com seus próprios incrementos). |
| `source-driven-development` | Toda convenção abaixo (layout, metadata, viewport, `src/`, alias `@/*`) vem de documentação oficial atual do Next.js via Context7, citada na seção 2. |
| `vercel:nextjs` | Contexto complementar sobre convenções do App Router. |
| `planning-and-task-breakdown` | **Não reaplicada.** `tasks/plan.md` já define os critérios exatos da Tarefa 1B; segui-os em vez de replanejar. |
| `frontend-ui-engineering` | **Não é o eixo principal.** Não há UI de produto sendo construída aqui — `page.tsx` é um placeholder que declara explicitamente que a migração visual real é a Tarefa 3. |

---

## 2. Fontes consultadas via Context7 (`/vercel/next.js/v16.2.9`)

Referência fixada na tag estável `v16.2.9` em vez da branch `canary` (ajuste solicitado na revisão) — é a mesma tag já usada como fonte na Tarefa 1A e a versão pinada mais próxima do Next.js efetivamente instalado (`16.3.3`, resolvido pelo range `^16.2.9`); são apenas patches de diferença dentro da mesma minor, e as convenções abaixo (layout raiz, Metadata/Viewport API, `src/app`, `tsconfig.paths`) são reconfirmadas idênticas ao consultar a doc já pinada nessa tag.

| Convenção | Fonte |
|---|---|
| Layout raiz precisa declarar `<html>`/`<body>` explicitamente | `docs/01-app/03-api-reference/03-file-conventions/layout.mdx` e `docs/01-app/02-guides/migrating/app-router-migration.mdx` |
| `page.tsx` é um componente default export | `docs/01-app/01-getting-started/01-installation.mdx` |
| `export const metadata` (título/descrição) e `export const viewport` (tema, largura) são exports separados desde a migração `metadata-to-viewport-export` | `docs/01-app/02-guides/upgrading/codemods.mdx` |
| CSS global deve ser importado dentro de `app/layout` | `docs/01-app/01-getting-started/11-css.mdx` |
| `src/app` é reconhecido automaticamente, sem config extra, desde que não exista `app/` na raiz | `docs/01-app/03-api-reference/03-file-conventions/src-folder.mdx` |
| Adotar `src/` normalmente exige atualizar `paths`/`baseUrl` do `tsconfig.json` com o prefixo `/src` | `docs/01-app/03-api-reference/03-file-conventions/src-folder.mdx` e `docs/01-app/01-getting-started/01-installation.mdx` |

---

## 3. Lista exata de arquivos

### 3.1 Código (implementação)

| Arquivo | Ação |
|---|---|
| `src/app/layout.tsx` | criar |
| `src/app/page.tsx` | criar |
| `src/app/globals.css` | criar |
| `tsconfig.json` | editar — só o valor de `paths."@/*"`, de `["./*"]` para `["./src/*"]` |
| `next.config.ts` | editar — adicionar `agentRules: false` (ver seção 11, adendo pós-implementação) |

Nenhum outro arquivo de código é tocado. Em particular, **não são criados** nesta tarefa: `src/app/(site)/`, `src/app/admin/`, `src/app/api/`, `public/`, `src/components/`, Tailwind/shadcn, ESLint — ver seção 6.

### 3.2 Documentação/governança (passo separado, depois da validação de código)

| Arquivo | Ação |
|---|---|
| `tasks/plan.md` | editar — marcar a Tarefa 1B como concluída |
| `tasks/todo.md` | editar — marcar a Tarefa 1B como concluída |

Ajuste ao parecer de revisão: esses dois arquivos **não** entram no `git status --short` da seção 7/9 que valida a implementação (esse é um checkpoint intermediário, rodado logo após criar/editar os cinco arquivos da seção 3.1 — os quatro originais mais `next.config.ts`, incluído pelo adendo da seção 11 — antes de qualquer atualização de governança). Só depois dessa validação de código os dois arquivos de `tasks/` são atualizados — mesma ordem usada na Tarefa 1A, cujo commit final (`57a414f`) incluiu `tasks/plan.md`/`tasks/todo.md` junto dos arquivos de código. O `git status --short` final, apresentado antes do commit desta tarefa, portanto mostrará os cinco arquivos da seção 3.1 **mais** os dois desta seção — não é uma divergência do escopo, é a mesma sequência já usada.

---

## 4. Conteúdo integral proposto

### 4.1 `src/app/layout.tsx`

Reaproveita exatamente os metadados já aprovados em `index.html` (`lang="pt-BR"`, título, description, `theme-color`) — não é uma decisão de design nova, é a mesma informação já publicada, só expressa via Metadata API do Next.js:

```tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FortSul | Equipamentos Agrícolas',
  description:
    'FortSul Equipamentos Agrícolas — tecnologia, instalação e suporte para uma produção mais eficiente.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a3478',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

### 4.2 `src/app/page.tsx`

Placeholder deliberado — não antecipa o design da home, que pertence à Tarefa 3 (Incrementos 2–8 já aprovados, execução obrigatória sem replanejamento):

```tsx
export default function Home() {
  return (
    <main>
      <h1>FortSul — fundação Next.js</h1>
      <p>
        Estrutura mínima do App Router (Tarefa 1B). A migração visual da
        home segue os Incrementos 2–8 já aprovados na Tarefa 3.
      </p>
    </main>
  )
}
```

### 4.3 `src/app/globals.css`

Reset mínimo, sem tokens de marca/design system — a paleta e tipografia aprovadas em `docs/DESIGN-SYSTEM.md` entram junto da migração real dos componentes na Tarefa 3, não nesta fundação:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
}
```

### 4.4 `tsconfig.json` (diff do campo `paths`)

```diff
-    "paths": { "@/*": ["./*"] }
+    "paths": { "@/*": ["./src/*"] }
```

Nenhum outro campo de `tsconfig.json` muda.

---

## 5. Compatibilidade com o preview estático e com a Tarefa 1A

- `npm run preview` (`node preview.mjs`, porta 4173) continua servindo `index.html`/`styles.css`/`script.js` sem nenhuma alteração — nenhum arquivo do site estático é tocado.
- `next dev` sobe por padrão na porta 3000; sem conflito com a porta 4173, mesmo em paralelo.
- Diferente da Tarefa 1A, aqui `next dev`/`next build` **passam a ter conteúdo real para servir/compilar** — isso resolve o risco 1 registrado em `docs/Proposta_Tarefa_1A.md` ("couldn't find any pages or app directory"), que era esperado até esta tarefa.
- `public/` continua não existindo; `page.tsx` não referencia nenhuma imagem — migração de assets é a Tarefa 2, que só começa depois deste checkpoint de fundação.

---

## 6. Escopo deliberadamente fora desta tarefa

| Item | Motivo |
|---|---|
| Migração real do design da home | Pertence à Tarefa 3 (Incrementos 2–8 já aprovados); `page.tsx` desta tarefa é só um placeholder que declara isso no próprio texto renderizado. |
| `src/app/(site)/`, rotas de produto/revendas | Dependem de decisões pendentes (Parte III do Plano Mestre — rota de Revendas) e da Tarefa 4. |
| `src/app/admin/` | Depende da Fase 3 (modelagem) e da Fase 4 (painel), não autorizadas. |
| `src/app/api/` | O Plano Mestre prevê que essa pasta "nasce vazia/placeholder" na Fase 2, mas uma pasta vazia não é rastreada pelo Git — não há nada de fato a versionar aqui ainda. Fica para quando a primeira necessidade real de rota surgir. |
| Tailwind CSS / shadcn/ui | Ainda não há decisão de quando entram na migração; `globals.css` fica com reset mínimo, sem dependência nova. |
| `next/font` (otimização de fonte) | Decisão de design/performance que pertence à migração visual (Tarefa 3), não à fundação. |
| ESLint / `eslint-config-next` | Mesmo motivo do risco 3 da Tarefa 1A — deliberadamente fora, `tasks/plan.md` não pede lint nesta fundação. |

---

## 7. Checklist de aceitação

- [ ] `src/app/layout.tsx` existe, declara `<html lang="pt-BR">`/`<body>`, importa `./globals.css`, exporta `metadata` e `viewport` com os valores já aprovados de `index.html`.
- [ ] `src/app/page.tsx` existe, componente default export, conteúdo placeholder (não antecipa o design da home).
- [ ] `src/app/globals.css` existe, reset mínimo, sem tokens de marca.
- [ ] `tsconfig.json` com `paths."@/*"` apontando para `./src/*`.
- [ ] `npm run dev` sobe sem erro; `GET /` responde 200 com o conteúdo placeholder.
- [ ] `npm run build` conclui sem erro.
- [ ] `npm run typecheck` conclui sem erro.
- [ ] `npm run preview` sobe sem erro (porta 4173, mesmo comando de sempre).
- [ ] `npm test` passa — reconfirma que a suíte existente (rotas estáticas, cache, 404, proteção contra path traversal) continua verde; é essa suíte, não só o `npm run preview` subir, que comprova "preview idêntico" (ajuste ao parecer de revisão).
- [ ] `git status --short` (checkpoint intermediário, logo após a seção 3.1) mostra só os cinco arquivos de código.
- [ ] Depois de atualizar `tasks/plan.md`/`tasks/todo.md` (seção 3.2), novo `git status --short` (checkpoint final, pré-commit) mostra os cinco arquivos de código mais esses dois arquivos de governança — nenhum outro.

---

## 8. Riscos e mitigações

| # | Risco | Mitigação / decisão declarada |
|---|---|---|
| 1 | `page.tsx` poderia ser confundido com a home real pelo Jose ao ver no navegador. | Texto do placeholder declara explicitamente "Tarefa 1B" e menciona a Tarefa 3, para não gerar expectativa de design pronto. |
| 2 | Alterar o alias `@/*` no `tsconfig.json` pode quebrar algum import existente. | Não há nenhum import usando `@/` no projeto ainda (nenhum arquivo `.ts`/`.tsx` de aplicação existia antes desta tarefa) — mudança sem efeito colateral hoje. |
| 3 | `next dev` rodando ao lado do `npm run preview` poderia confundir qual serve o quê durante teste manual. | Portas diferentes (3000 vs 4173); listarei explicitamente qual URL testar em cada critério na lista de testes manuais após implementação. |
| 4 | Nenhuma dependência nova é necessária para esta tarefa. | Sem risco de peso adicional no bundle. |

---

## 9. Validações planejadas (após aprovação e implementação)

- `npm run dev` + `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` — confirma 200.
- `npm run build` — confirma build de produção sem erro.
- `npm run typecheck` — confirma `tsc --noEmit` sem erro.
- `npm run preview` — confirma que o servidor de preview sobe normalmente.
- `npm test` — confirma que a suíte existente (rotas estáticas, cache, 404, path traversal) continua passando; é essa suíte que comprova "preview idêntico", não só o processo subir (ajuste ao parecer de revisão).
- `git status --short` (checkpoint intermediário) — confirma que só os cinco arquivos da seção 3.1 mudaram, antes de tocar em `tasks/`.
- `git status --short` (checkpoint final, pré-commit, depois da seção 3.2) — confirma que só os cinco arquivos de código mais `tasks/plan.md`/`tasks/todo.md` mudaram.

---

## 10. Bloco de status

```text
STATUS: IMPLEMENTADA — AGUARDANDO APROVAÇÃO DUPLA/COMMIT

ALTERAÇÕES
- src/app/layout.tsx, src/app/page.tsx, src/app/globals.css criados
- tsconfig.json: paths."@/*" de ["./*"] para ["./src/*"]
- next.config.ts: agentRules: false adicionado (achado pós-implementação, ver seção 11)
- tasks/plan.md e tasks/todo.md atualizados marcando a Tarefa 1B como concluída

VALIDAÇÕES (executadas; revalidadas após o adendo agentRules da seção 11)
- npm run dev: GET / -> 200 com o placeholder; rota inexistente -> 404; CLAUDE.md permanece sem alteração
- npm run build: compilado com sucesso; / e /_not-found gerados como estático
- npm run typecheck: sem erro
- npm run preview: sobe normalmente, HTTP 200
- npm test: suíte existente (rotas estáticas, cache, 404, path traversal) passou — comprova "preview idêntico"
- git status --short, checkpoint intermediário: só os 5 arquivos de código da seção 3.1
- git status --short, checkpoint final: + tasks/plan.md e tasks/todo.md da seção 3.2, nenhum outro

PENDÊNCIAS E RISCOS
- Nenhum risco bloqueante remanescente. Achado do agentRules (Next.js injetando bloco em CLAUDE.md a cada `next dev`) resolvido por decisão do Jose — ver seção 11.

FORA DO ESCOPO
- Migração real do design da home — Tarefa 3 (Incrementos 2–8 já aprovados)
- Tarefa 2 (assets em public/), Tarefa 4 (produto/404)
- src/app/(site), src/app/admin, src/app/api
- Tailwind CSS, shadcn/ui, next/font, ESLint

DOCUMENTAÇÃO E SECOND BRAIN
- Tarefa 1B marcada como concluída em tasks/plan.md e tasks/todo.md (feito)
- Falta: atualizar a proposta de status da seção 0.2 do Plano Mestre (proposta, não edição direta)
```

---

**Aprovada pelo Jose e revisada tecnicamente pelo Claude antes da implementação**, conforme a seção 4 da Parte I do `PLANO_MESTRE_FORTSULSC.md`.

---

## 11. Adendo pós-implementação — `agentRules: false`

Achado não previsto nesta proposta, surgido ao validar `npm run dev`: o Next.js 16 (recurso `agentRules`, ligado por padrão desde a 16.1, documentado em `docs/01-app/02-guides/ai-agents.mdx` da tag `v16.2.9`) injeta automaticamente um bloco `<!-- BEGIN:nextjs-agent-rules -->` em `CLAUDE.md` a cada execução de `next dev`, para apontar agentes de IA para `node_modules/next/dist/docs/`.

Como `CLAUDE.md` é o arquivo de governança deliberada deste projeto (exige leitura obrigatória, define o fluxo de aprovação em duas camadas e o uso de Context7 — ver seção 3.1 do próprio `CLAUDE.md`), a alteração automática não foi aceita sem decisão explícita. Duas opções foram apresentadas ao Jose:

1. Desativar via `agentRules: false` em `next.config.ts`.
2. Aceitar o comportamento padrão e commitar o bloco toda vez que reaparecer.

**Decisão do Jose: opção 1.** Motivo declarado: preservar `CLAUDE.md` como fonte de instruções deliberada e estável, já que o projeto tem governança própria e exige Context7. Implementado como um campo a mais em `next.config.ts` (seção 3.1), sem tocar em `CLAUDE.md`. Nenhuma outra mudança de escopo decorre disso.
