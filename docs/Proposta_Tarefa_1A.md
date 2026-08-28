# Proposta — Tarefa 1A: Fundação Next.js e TypeScript

Status: APROVADO — AGUARDANDO COMMIT DOCUMENTAL E IMPLEMENTAÇÃO
Data: 27/08/2026
Escopo autorizado: somente Tarefa 1A, conforme `tasks/plan.md` e `tasks/todo.md`
Savepoint confirmado: commit `4833f97` ("chore: ignorar configuracoes locais e logs de preview")

> Este documento é uma proposta. Nenhum arquivo de código ou configuração foi criado, editado ou instalado para produzi-lo. A única escrita autorizada nesta etapa é este próprio arquivo.

## Revisão aplicada (comentários recebidos em 27/08/2026)

1. **`next-env.d.ts`** — confirmado como já correto: ignorado no `.gitignore` e mantido no `include` do `tsconfig.json`. Nenhuma mudança necessária.
2. **Nomenclatura de scripts** — corrigida. Os comandos do Next.js agora usam os nomes canônicos (`dev`, `build`, `start`); o preview estático passa a se chamar `preview` (antes ocupava o nome `dev`). Refletido nas seções 4.1, 5, 6, 7, 8 e 9.
3. **Typecheck** — `"typecheck": "tsc --noEmit"` (script mantido, sem `next typegen`). A Tarefa 1A cria `next.config.ts`, que é ele mesmo um arquivo `.ts` casado pelo padrão `**/*.ts` já presente no `include` do `tsconfig.json` — ou seja, sempre há pelo menos um arquivo para o TypeScript checar ao final desta tarefa. `npm run typecheck` deve, portanto, **concluir sem erro**, e isso volta a ser critério de aceite normal desta tarefa (não uma falha esperada). Refletido nas seções 6, 7, 8 e 9.

---

## 0. Verificação do estado do repositório

```
$ git log --oneline -5
4833f97 chore: ignorar configuracoes locais e logs de preview   ← savepoint confirmado
2e82148 docs: registrar backlog da animação do Bioqueimador de Cavaco no Plano Mestre
abcb185 fix: corrigir contraste WCAG e acabamento de acessibilidade no frontend estático
f241fa1 feat: seção Novidades e dicas (teste) + planejamento da Fase 2 aprovado
88e7d6f feat: estabelecer baseline aprovado da fase 1

$ git status --short
?? .agents/
?? skills-lock.json
```

Working tree limpo, exatamente como o checkpoint pré-fundação exige (só as duas exceções já previstas).

```
$ git log --all --full-history -- recovery-codes-vercel-fortsul.txt
(sem saída — nenhum commit, em nenhum branch, referencia esse arquivo)
```

Nenhum indício do arquivo de recovery codes no histórico. Consistente com o registro já existente em `PLANO_MESTRE_FORTSULSC.md` (item de segurança 🟢) e em `docs/RULES.md`, seção 12.1.

Node.js local verificado: `v22.23.2` (acima do mínimo exigido pelo Next.js 16, `>=20.9.0`).

---

## 1. Skills aplicadas

| Skill | Por quê |
|---|---|
| `using-agent-skills` | Ponto de entrada obrigatório; mapeia a tarefa na árvore de decisão do conjunto de skills instalado. |
| `incremental-implementation` | A Tarefa 1A é tratada como uma fatia isolada e aditiva (só cria/edita arquivos de configuração, nada destrutivo, nenhuma dependência de outra fatia ainda não aprovada). |
| `source-driven-development` | Toda versão e todo trecho de configuração abaixo vem de documentação oficial atual do Next.js (v16.2.9, via Context7), com citação de fonte — nada assumido por conhecimento interno. |
| `vercel:nextjs` | Skill específica do Next.js instalada nesta sessão; usada como contexto complementar (convenções de `next.config.ts`, TypeScript, estrutura de projeto) às citações do Context7. |
| `planning-and-task-breakdown` | **Não reaplicada.** `tasks/plan.md` e `tasks/todo.md` já contêm o plano aprovado; segui-o em vez de replanejar. |
| `test-driven-development` | **Não é o eixo principal aqui.** Não há regra de negócio para ciclo red-green nesta tarefa — é configuração de projeto. A verificação segue o checklist de incremento de `incremental-implementation` (instalação, typecheck, preservação do preview estático). |

---

## 2. Versões confirmadas via Context7

| Pacote | Versão proposta | Fonte consultada |
|---|---|---|
| `next` | `^16.2.9` (estável mais recente disponível) | Context7 `/vercel/next.js` — listagem de versões |
| `react` / `react-dom` | `^19.2.7` | Context7 `/react/react` — listagem de versões |
| `typescript` | `^5` | `github.com/vercel/next.js/blob/canary/packages/create-next-app/templates/index.ts` — é o que o próprio `create-next-app` instala hoje. TypeScript `6.0.2` já aparece no índice do Context7, mas a fonte mais autorizada (o template oficial do Next.js) ainda fixa `^5`; segui essa fonte em vez de adotar o major mais novo por conta própria. |
| `@types/node` | `^20` | Mesmo template oficial, alinhado a `engines.node >= 20.9.0`. |
| `@types/react`, `@types/react-dom` | `^19` | Mesmo template oficial. |
| Node.js mínimo exigido | `>=20.9.0` | `packages/next/package.json` (branch canary) + guia de upgrade da versão 16 (`docs/01-app/02-guides/upgrading/version-16.mdx`) — Node 18 foi descontinuado nesta major. |
| `next.config.ts` suportado nativamente | Desde Next.js 15.0.0 | `docs/01-app/03-api-reference/05-config/02-typescript.mdx` |
| `next-env.d.ts` deve ir para `.gitignore` | Confirmado | `docs/01-app/02-guides/migrating/from-create-react-app.mdx` e `docs/01-app/03-api-reference/05-config/02-typescript.mdx` |

Todas as consultas foram feitas contra a documentação da tag `v16.2.9` do repositório `vercel/next.js`, a versão estável mais recente identificada no índice do Context7 no momento desta proposta (27/08/2026).

---

## 3. Lista exata de arquivos

| Arquivo | Ação |
|---|---|
| `package.json` | editar — adicionar `dependencies`, `devDependencies`, `engines` e 4 scripts novos; **nada existente é removido** |
| `tsconfig.json` | criar |
| `next.config.ts` | criar |
| `.gitignore` | editar — uma linha adicional (`next-env.d.ts`) |
| `package-lock.json` | gerado automaticamente por `npm install`, não escrito à mão |

Nenhum outro arquivo é tocado nesta tarefa. Em particular, **não são criados**: `public/`, `src/app`, `layout.tsx`, `page.tsx`, `.eslintrc`/`eslint.config.*` — isso pertence à Tarefa 1B/2 ou é deliberadamente deixado de fora (ver seção 7, risco 3).

---

## 4. Conteúdo integral proposto

### 4.1 `package.json`

```json
{
  "name": "fortsul-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "preview": "node preview.mjs",
    "test": "node --test test-preview.mjs",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^16.2.9",
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```

### 4.2 `tsconfig.json`

Template canônico atual gerado pelo próprio Next.js (via `create-next-app` ou ao rodar `next dev` após adicionar um arquivo `.ts`), sem alteração — ainda não existe `src/`, então o alias `@/*` aponta para a raiz do projeto, exatamente como o template já prevê nesse cenário:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### 4.3 `next.config.ts`

Mínimo possível para esta etapa. O projeto já é `"type": "module"`, então a sintaxe ESM (`import`/`export default`) funciona diretamente, sem precisar renomear para `.mts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

### 4.4 `.gitignore` (uma linha adicionada à seção já existente de build/cache)

```
next-env.d.ts
```

---

## 5. Preservação concreta do preview estático

- O comportamento do preview estático **não muda uma vírgula** — só o nome do script muda, de `dev` para `preview` (decisão explícita desta revisão, para liberar `dev`/`build`/`start` para os comandos canônicos do Next.js). O comando em si continua idêntico: `node preview.mjs`, servindo `index.html`/`styles.css`/`script.js` exatamente como hoje.
- Os globs de `include` do `tsconfig.json` só casam `.ts`/`.tsx`/`.mts` (mais `next-env.d.ts`, gerado à parte). Não existe nenhum arquivo `.ts`/`.tsx` de **código de aplicação** ainda no projeto — a única exceção é o próprio `next.config.ts` desta tarefa, que é configuração, não parte do site estático. `preview.mjs`, `script.js`, `test-preview.mjs` e qualquer `.html` continuam fora do escopo do TypeScript — o compilador **não os enxerga** — zero interferência.
- `next.config.ts` não define `rewrites`, `redirects` nem `output` — não intercepta nada.
- Sem `src/app` ou `pages/`, `next dev`/`next build` não têm nenhuma rota para servir ou compilar — ficam inertes nesta etapa (ver risco 1). Mesmo que rodem, `next dev` sobe por padrão na porta 3000; o preview estático (`npm run preview`) usa 4173 — sem conflito de porta mesmo em paralelo.
- Nenhum arquivo do site público (`index.html`, `404.html`, `produto-alimentador.html`, `styles.css`, `script.js`, `image/`, `robots.txt`) é criado, movido ou apagado por esta tarefa.

---

## 6. Checklist de aceitação

- [ ] `package.json` lista exatamente `next`, `react`, `react-dom` (dependencies) e `typescript`, `@types/node`, `@types/react`, `@types/react-dom` (devDependencies) — nenhuma dependência fora dessa lista.
- [ ] Scripts `dev` (`next dev`), `build` (`next build`), `start` (`next start`) e `typecheck` (`tsc --noEmit`) existem e apontam para os comandos corretos do Next.js.
- [ ] Script `preview` existe e roda `node preview.mjs` — mesmo comportamento que o antigo script `dev` tinha, só o nome mudou.
- [ ] `tsconfig.json` e `next.config.ts` existem e correspondem ao conteúdo da seção 4.
- [ ] `.gitignore` inclui `next-env.d.ts`.
- [ ] `npm install` conclui sem erro e gera `package-lock.json`.
- [ ] `npm run typecheck` conclui **sem erro** — `next.config.ts` (criado nesta tarefa) já é um arquivo `.ts` casado pelo padrão `**/*.ts` do `include`, então sempre há pelo menos um arquivo para checar.
- [ ] `npm run preview` continua servindo `index.html` sem qualquer diferença visual ou funcional.
- [ ] `git status --short` mostra somente os arquivos desta lista antes do commit da Tarefa 1A.
- [ ] **Não é critério desta tarefa** `next dev`/`next build` servirem uma página de verdade — depende da Tarefa 1B (ver risco 1). `npm run typecheck` passar sem erro **é** critério desta tarefa.

---

## 7. Riscos e mitigações

| # | Risco | Mitigação / decisão declarada |
|---|---|---|
| 1 | `next dev`/`next build` vão falhar com "couldn't find any pages or app directory" até a Tarefa 1B criar `src/app`. | Esperado, não é regressão. Será reportado como resultado real na validação, não maquiado como sucesso. Não faz parte do critério de aceite desta tarefa. |
| 2 | **Resolvido nesta revisão.** Nomenclatura de scripts: os comandos do Next.js agora usam os nomes canônicos (`dev`, `build`, `start`), e o preview estático foi renomeado de `dev` para `preview`. | Decisão explícita, alinhada aos "scripts oficiais do Next" pedidos na revisão. Documentado nas seções 4.1, 5 e 6. |
| 3 | ESLint/`eslint-config-next` não incluído nesta tarefa. | Deliberado: `tasks/plan.md` pede explicitamente "instalar apenas Next.js, React, React DOM e TypeScript/tooling indispensável à fundação". Lint fica como candidato a tarefa futura, não implícito nesta. |
| 4 | Duas dependências de peso real entram no repositório (Next.js + React). | Não são "desnecessárias" — são a base da própria Fase 2 já aprovada. Registro apenas o aumento de superfície de `node_modules` (que já está no `.gitignore`). |
| 5 | Gerenciador de pacote assumido como `npm`. | Não há lockfile nem campo `packageManager` hoje no projeto. Suposição conservadora e declarada; fácil de trocar antes da execução se preferir pnpm/yarn/bun. |
| 6 | Next.js coleta telemetria anônima por padrão. | Não bloqueia nem faz parte do escopo. Se desejar desativar: `npx next telemetry disable`, comando manual do Jose após a instalação — não será executado por mim sem pedido. |

**Nota sobre typecheck:** `npm run typecheck` (`tsc --noEmit`) não é tratado como risco — deve concluir sem erro, porque `next.config.ts` (criado nesta própria tarefa) já é casado pelo padrão `**/*.ts` do `include` do `tsconfig.json`, garantindo pelo menos um arquivo de entrada para o TypeScript checar.

---

## 8. Validações planejadas (após aprovação e implementação)

- `npm install` — confirma instalação limpa e geração de `package-lock.json`.
- `npm run typecheck` (`tsc --noEmit`) — confirma que roda sem erro (há pelo menos `next.config.ts` para checar).
- `npm run preview` — confirma que o preview estático continua idêntico ao atual (comparação visual/funcional).
- `git status --short` — confirma que só os arquivos da seção 3 foram alterados.
- `npx next --version` e `npx tsc --version` — confirmam que as versões resolvidas batem com as propostas na seção 2.

---

## 9. Bloco de status (formato do contrato operacional, seção 10)

```text
STATUS: APROVADO — AGUARDANDO COMMIT DOCUMENTAL E IMPLEMENTAÇÃO

ALTERAÇÕES
- (nenhuma ainda — a implementação começa somente após o commit documental desta proposta)

VALIDAÇÕES
- npm install (instalação limpa + package-lock.json)
- npm run typecheck, ou seja, tsc --noEmit (deve concluir sem erro — next.config.ts já satisfaz o include do tsconfig)
- npm run preview (preview estático idêntico ao atual)
- git status --short (só os arquivos previstos na seção 3 mudam)
- npx next --version / npx tsc --version (versões resolvidas conferem com a seção 2)

PENDÊNCIAS E RISCOS
- next dev/next build vão falhar (esperado) até a Tarefa 1B criar src/app — não é critério de aceite desta tarefa
- Gerenciador de pacote assumido como npm (risco 5 da seção 7) — sigo salvo objeção

FORA DO ESCOPO
- Tarefa 1B (App Router, layout.tsx, page.tsx) — não inicia sem aprovação separada
- public/ e migração de assets (Tarefa 2)
- ESLint/eslint-config-next — não incluído nesta tarefa
- PostgreSQL, Prisma, Auth.js, painel administrativo, Route Handlers/Server Actions, Docker, CMS de Artigos, mapas interativos com dados dinâmicos

DOCUMENTAÇÃO E SECOND BRAIN
- Após aprovação e implementação: marcar a Tarefa 1A como concluída em tasks/plan.md e tasks/todo.md
- Registrar no Second Brain, como fato durável de stack, as versões confirmadas (Next.js 16.2.9 / React 19.2.7 / TypeScript ^5)
```

---

**Conteúdo aprovado por José em 27/08/2026, com a correção editorial da seção 5 aplicada.** Falta apenas o commit documental deste arquivo (ver abaixo) antes de iniciar a implementação da Tarefa 1A.
