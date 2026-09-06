# Proposta — UI funcional de login administrativo (Fatia 4.3)

Substitui, para esta worktree, `FortSulSC-login-ui/docs/Proposta_UI_Login.md` (protótipo puramente visual, sem chamadas de rede). Esta versão implementa uma UI real contra os endpoints já existentes desta worktree.

## Contexto e autorização da exceção

- Exceção pontual autorizada por Jose Tavares em 2026-09-05: iniciar UI de login antes da conclusão formal da Fase 4 (o Plano Mestre marca a Fase 4 — Painel administrativo — como não iniciada, condicionada à conclusão da Fase 3). Escopo da exceção: apenas a tela de login e o consumo dos endpoints de autenticação já implementados nesta worktree; não abre a Fase 4 como um todo, nem autoriza painel, CRUD ou navegação administrativa.
- Motivo declarado por Jose: o desenvolvimento desta UI é necessário para finalizar o teste da Fatia 4.3, que ainda não foi mesclada à `main`.
- A nota `40-Padroes/FortSulSC - Teste manual de login MFA local` (Second Brain) já registra essa dependência em "Pendência de UI": *"Quando a futura tarefa criar a tela de login do admin, repetir no navegador os testes de senha, MFA, sessão e replay descritos neste guia. A UI deve usar os endpoints existentes e nunca ler/exibir cookies, hashes ou códigos fora do campo protegido de entrada."*

## Objetivo

Construir uma tela de login real em `/admin/login`, dentro da worktree `feature/claude-fatia-4-3-auth-security`, consumindo os endpoints já implementados (`POST /api/admin/login/password`, `POST /api/admin/login/code`), para permitir repetir manualmente no navegador os cenários hoje validados só via PowerShell.

## Escopo funcional

1. `src/app/admin/layout.tsx` — layout mínimo, sem `SiteHeader`, `SiteFooter` ou WhatsApp flutuante.
2. `src/app/admin/login/page.tsx` — rota e metadados; renderiza `LoginForm`.
3. `src/components/admin/LoginForm.tsx` (client component) com máquina de estados de 2 passos, espelhando exatamente o contrato das rotas já existentes:

   **Passo senha** — `POST /api/admin/login/password` com `{ email, password }`, `credentials: 'same-origin'`:
   - `200 { step: 'code_sent' }` → avança para o passo código.
   - `401` → mensagem genérica única: "Credenciais inválidas ou conta temporariamente bloqueada." (o back-end usa a mesma frase para senha errada, conta inexistente e conta inativa — a UI não deve tentar diferenciar).
   - `429` → mesma mensagem genérica acima (o back-end usa o mesmo texto para bloqueio).
   - Validação client-side de campos vazios antes de chamar a API (evita gerar `400` desnecessário).

   **Passo código** — `POST /api/admin/login/code` com `{ code }`, cookie `fs_pending_login` já definido pelo passo anterior:
   - Campo único de 6 dígitos: `inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength={6}`.
   - `200 { step: 'authenticated' }` → redireciona para a página de confirmação de sessão (ver abaixo).
   - `401` → "Código inválido ou expirado."
   - `429` → "Muitas tentativas. Tente novamente mais tarde."
   - Ação "reenviar código": repete o passo senha com os dados ainda em memória; se cair dentro do cooldown de 60s, o back-end responde com o mesmo `401` genérico do passo senha — exibir texto local "Aguarde antes de solicitar outro código." sem inventar um status novo.

4. Nenhum dado sensível (senha, código, cookies) é escrito em `console.log`/`console.error`, `localStorage` ou `sessionStorage` — apenas estado React em memória, perdido no reload da página.
5. Página de destino pós-login: como o painel administrativo (Fase 4) não existe, criar `src/app/admin/session-check/page.tsx` — Server Component que chama `auth()` e exibe nome/e-mail/role da sessão atual, com texto explícito informando que é um artefato de teste da Fatia 4.3, não o painel administrativo real. Se `auth()` retornar sessão nula, redireciona para `/admin/login`.

## Fora de escopo (mantido da proposta original)

- Qualquer alteração em `src/lib/auth/*`, `src/app/api/admin/*` ou no schema Prisma — a UI só consome os endpoints existentes; não corrige nem estende o back-end (inclusive bugs já conhecidos, como a ausência de `try/catch` ao redor de `signIn()` em `login/code/route.ts`, documentados em `docs/claude-fatia-4-3-auth-security.md` do repositório principal).
- Checkbox "Manter acesso neste dispositivo" da proposta visual original — **removido**. O cookie `fs_device_id` já é definido automaticamente pelo servidor em toda requisição de login (ver `src/lib/auth/device.ts`), só para bucketing de rate limit, sem qualquer opção de usuário nem semântica de "pular MFA". Incluir esse controle sugeriria uma capacidade que o back-end não tem.
- Qualquer rota de painel além da página mínima de confirmação de sessão (sem navegação, sem CRUD, sem listagem de dados).
- Middleware genérico de proteção de rotas `/admin/*` — fora desta fatia; a própria página de confirmação de sessão trata sessão ausente localmente.
- Recuperação de senha, cadastro, TOTP — TOTP já é tratado como opcional e não implementado no rascunho atual da Fatia 4.3.
- Tailwind, shadcn/ui, Radix, Motion ou qualquer dependência nova.

## Design visual

Reaproveita integralmente a direção visual já revisada tecnicamente na proposta original: fundo `--blue-950`/`--blue-900` com área institucional no desktop, card claro com `--radius: 18px` e `--shadow`, botões com radius ~7px, CTA em `--orange`, logo FortSul, coluna institucional oculta em telas estreitas, formulário sempre legível e navegável por teclado. Nenhum token novo — `docs/DESIGN-SYSTEM.md` é idêntico nesta worktree e na worktree do protótipo visual.

## Contrato de teste

- **Componente** (`LoginForm.test.tsx`, Vitest + Testing Library, `fetch` mockado): os 5 estados de resposta descritos acima (`code_sent`, `401`/`429` no passo senha, `401`/`429` no passo código, `authenticated`), toggle de mostrar/ocultar senha, labels e nomes acessíveis, ordem de tabulação.
- **Rota** (`page.test.tsx`, opcional): confirma ausência de `SiteHeader`/`SiteFooter`/WhatsApp no layout `/admin`.
- **Manual no navegador (Jose)**: repetir os cenários já descritos em `40-Padroes/FortSulSC - Teste manual de login MFA local` — senha válida, código válido, replay do código, cooldown de reenvio, não enumeração de contas, CSRF no logout — agora pela UI em vez de PowerShell, fechando formalmente a "Pendência de UI" registrada nesse guia.

## Critérios de aceite

- `/admin/login` funcional contra o Docker local desta worktree, sem alterar nenhum arquivo de `src/lib/auth` ou `src/app/api/admin`.
- Campos de e-mail e senha usam `autoComplete="email"`/`autoComplete="current-password"`; campo de código usa `autoComplete="one-time-code"`.
- Os 6 cenários do guia de teste manual (Second Brain) passam pela UI, com os mesmos resultados já validados via PowerShell.
- Nenhuma credencial, código ou cookie aparece em `console.log`, no DOM fora do campo de senha/código, ou em armazenamento persistente do navegador.
- Lint, typecheck, testes automatizados e build passam.
- Revisão do `ui-reviewer` (acessibilidade/responsividade) antes da revisão final do Claude, conforme `CLAUDE.md` §3.1.7.

## Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| UI ser confundida com o painel administrativo real | Página de confirmação de sessão traz texto explícito de que é artefato de teste da Fatia 4.3. |
| Reintroduzir bug já conhecido do back-end (ex.: exceção não tratada em `signIn()`) | UI trata qualquer resposta não-200 de forma genérica (sem depender de um formato de erro específico), então uma exceção 500 não tratada aparece como "erro inesperado" em vez de quebrar a tela — mas o bug em si continua registrado como pendência do back-end, não desta proposta. |
| Header/footer público interferir no fluxo | Layout `/admin` dedicado, sem reaproveitar o layout público. |
| Precedente de escopo (abrir Fase 4 "pela porta dos fundos") | Exceção registrada nesta proposta como pontual e vinculada exclusivamente ao teste da Fatia 4.3; não implica autorização para páginas adicionais do painel. |

## Notas de implementação (registradas após a entrega)

- **Mecanismo do layout `/admin` sem chrome público**: o item 1 do escopo previa apenas `src/app/admin/layout.tsx` como "layout mínimo, sem `SiteHeader`, `SiteFooter` ou WhatsApp flutuante". Na implementação, isso não bastava, porque `src/app/layout.tsx` (raiz) já renderizava `SiteHeader`/`SiteFooter`/`WhatsAppProvider`/`FloatingWhatsApp` incondicionalmente para toda a árvore de rotas — um layout aninhado em `/admin` não consegue remover o que o layout raiz já renderizou. A reestruturação em route groups (`(site)/`), reservada em `docs/ARCHITECTURE.md` seção 5 para validação futura separada, resolveria isso de forma definitiva, mas está fora do escopo desta exceção pontual. Solução adotada, sugerida pelo `scope-gate-reviewer`: `src/components/layout/SiteChrome.tsx`, um wrapper `'use client'` que lê `usePathname()` e só renderiza `SiteHeader`/`SiteFooter`/`WhatsAppProvider`/`FloatingWhatsApp` fora de `/admin/*`; `src/app/layout.tsx` passou a delegar a `<SiteChrome>{children}</SiteChrome>` em vez de renderizar o chrome diretamente. Menor alteração possível dentro do escopo aprovado, sem abrir a reestruturação de pastas reservada.
- **Bloqueio de ambiente em `npm run test:unit` (Vitest)**: nesta worktree (sob `/mnt/c/...`, acessada via WSL), `require('jsdom')` isoladamente leva 65–85s para carregar (reproduzido com um script Node avulso, sem Vitest envolvido), o que excede o timeout fixo de 60s que o Vitest usa para considerar um worker "iniciado" (`START_TIMEOUT` em `node_modules/vitest/dist/chunks/cli-api.*.js`, não configurável via CLI/config). O efeito é que **toda** a suíte que usa `environment: 'jsdom'` falha por timeout de inicialização do worker — inclusive um teste trivial pré-existente (`src/app/globals.test.ts`), não tocado nesta fatia — confirmando que não é uma regressão introduzida por `LoginForm.test.tsx` nem pelo `npm install` rodado para restaurar um binding nativo do ESLint. Testes forçados a `--environment=node` (sem jsdom) rodam normalmente em ~27s. `LoginForm.test.tsx` foi escrito e passa em `tsc --noEmit`, mas não pôde ser executado de fato nesta worktree. Reprodução: `node -e "require('jsdom')"` e medir o tempo; ou `npx vitest run src/app/globals.test.ts --environment=jsdom --pool=forks`. Este bloqueio deve ser reproduzido/confirmado por Jose (ou testado numa cópia do repositório fora de `/mnt/c`, ex. `~/` nativo do WSL) antes de considerar o critério de aceite "testes automatizados... passam" satisfeito para a parte de Vitest.

## Dependência para implementação

Aprovação já concedida por Jose (exceção pontual, 2026-09-05) para o escopo acima. Falta ainda: revisão técnica do Claude sobre este documento e, após o primeiro componente visual, delegação ao `ui-reviewer` (`CLAUDE.md` §3.1.7). Nenhum commit, merge ou push deve ser feito por agente — código e documentação ficam nesta worktree até decisão do Jose.
