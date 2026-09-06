# Proposta técnica — Tarefa 4, Fatia 4.3 (Auth.js + AdminUser + MFA por e-mail + proteção de tentativas)

Status: **PROPOSTA TÉCNICA REVISADA — AGUARDANDO APROVAÇÃO EXPLÍCITA DO JOSE. IMPLEMENTAÇÃO EM RASCUNHO ISOLADO (ver §10), NADA COMMITADO/MERGEADO.**
Data original: 03/09/2026. Revisão 1: 03/09/2026 (endereça auditoria de segurança — ver `docs/Prompt_Mestre_Seguranca_Agentes.md` e memória `project_fatia_4_3_security_audit`). Revisão 2: 04/09/2026 (adiciona §3.4 — TOTP com `otplib`, opcional por usuário, substituindo o código por e-mail quando ativado — decisão confirmada por Jose no mesmo dia; ainda não implementado no rascunho, ver §13).

Esta é a primeira fatia da Fase 3 que cria autenticação/admin (`CLAUDE.md` §2 e §13 exigem aprovação explícita antes de qualquer implementação chegar a `main`).

## 0. Origem e estado do repositório (corrigido nesta revisão)

- `main`/`origin/main` em `20b1393` (merge `merge: corrigir geração do Prisma na Vercel`, confirmado por Jose em 03/09/2026 — **corrige o commit `2700435` citado erroneamente na versão anterior desta proposta**). Schema atual: `Category`/`Product`/`ProductCategory`/`ProductApplication`/`ProductSpecification`/`ProductImage` (Fatia 4.1) + `Region`/`State`/`Municipality`/`CommercialArea`/`CommercialAreaMunicipality`/`Partner`/`PartnerPrivate`/`PartnerCommercialArea` (Fatia 4.2).
- **Correção de governança**: a versão anterior desta proposta afirmava que os cabeçalhos de segurança (`next.config.ts`) já estavam na `main`. Isso está errado — `next.config.ts` continua como alteração local não commitada (`git status` mostra ` M next.config.ts`). A proteção de headers **não está implantada** até Jose commitar essa mudança (rastreada em separado, fora desta fatia).
- Modelo geral da Fase 3 aprovado em 01/09/2026 (`docs/Proposta_Tarefa_4_Fase3_Modelagem.md` §3.9, §3.11.1): `AdminUser` com dois perfis aprovados (`ADMIN`, `EDITOR`); login exige código enviado por e-mail para todos os usuários internos; `LoginAttempt` bloqueia após cinco tentativas malsucedidas; dados de segurança seguem retenção de um ano.
- **`docs/Prompt_Mestre_Seguranca_Agentes.md`** é política de segurança obrigatória do projeto, com prioridade sobre decisões de implementação (`CLAUDE.md` §2/§13/§14). Uma auditoria de segurança contra a versão anterior desta proposta concluiu **não aprovar a implementação** por 8 lacunas (registradas na memória `project_fatia_4_3_security_audit`). Esta revisão endereça as 8, uma por uma, nas seções abaixo.

## 1. Escopo desta fatia

### 1.1 Incluído

1. `AdminUser` — cadastro interno (`email` único, `name`, `role` enum `ADMIN`/`EDITOR`, `passwordHash`, `active`, `tokenVersion` — novo campo, ver §3.3).
2. Login em duas etapas: senha (primeiro fator) → segundo fator obrigatório, código de 6 dígitos por e-mail por padrão, ou TOTP (app autenticador) para quem ativar (§3.4) — sempre exatamente dois fatores, nunca zero nem três.
3. `LoginAttempt` — registro de cada tentativa (sucesso ou falha, em qualquer etapa).
4. `RateLimitCounter` — novo modelo, contadores atômicos multi-dimensão (§3.1).
5. `PendingLogin` — novo modelo, estado de MFA pendente do lado do servidor (§3.2), substitui o "cookie que referencia `adminUserId`" da versão anterior.
6. Sessão via Auth.js (`next-auth` v5), estratégia JWT, com revogação ativa (§3.3).
7. Seed de um único `AdminUser` inicial (Admin), com senha definida por variável de ambiente na primeira execução — nunca hardcoded no repositório.
8. Papéis e privilégio mínimo no banco (§4) e RLS deny-by-default nas tabelas de segurança (§5).
9. Rotina de expurgo de dados de segurança (§6).
10. Contrato de testes em código (§8).
11. TOTP (`otplib`) como segundo fator opcional por usuário, substituindo o código por e-mail quando ativado (§3.4, decisão confirmada por Jose em 04/09/2026) — **especificado nesta proposta, ainda não escrito no rascunho de código**; entra na implementação na próxima rodada.

### 1.2 Excluído desta fatia (fica para fatias seguintes ou depende de decisão do Jose)

- Qualquer página/rota `/admin` de UI (dashboard, formulários, CRUD visual). Esta fatia só entrega o back-end de autenticação; não há tela nova. **Pendência**: quando a futura tarefa criar a tela de login, repetir no navegador o fluxo validado por API (senha → código por e-mail → sessão) e o teste de replay, no qual a repetição do mesmo código deve retornar `401`.
- `Article`, `AuditLog` (Fatia 4.4 — depende desta).
- `InstitutionalSettings`, `Banner` (Fatia 4.5).
- Recuperação de senha (esqueci minha senha) — fica para decisão futura pontual.
- Termos de Uso / Política de Privacidade — **gap identificado pela auditoria, não fabricado aqui**: é conteúdo legal/de negócio, não uma decisão técnica que eu deva redigir. Fica registrado como pendência formal a resolver com Jose antes do lançamento público do admin (não bloqueia esta fatia, que é só back-end sem UI).
- CAPTCHA — mantido fora do escopo pelos mesmos motivos da versão anterior (uso interno, sem cadastro público); registrado como opção futura se o bloqueio multi-dimensão (§3.1) se mostrar insuficiente.

### 1.3 Decisão técnica proposta: sem `PrismaAdapter` do Auth.js

Mantida da versão anterior — ver justificativa completa no histórico do documento. Resumo: `Credentials` provider + `session: { strategy: "jwt" }` não exige adapter; `Account`/`Session`/`VerificationToken` ficariam vazias/sem uso real. Tabelas de domínio próprias (`AdminUser`, `AdminLoginCode`, `PendingLogin`, `LoginAttempt`, `RateLimitCounter`) substituem essa necessidade.


Decisão José 04/09/2026 - Sim, aprovado. Usar Auth.js + JWT sem PrismaAdapter.


### 1.4 Decisão técnica proposta: provedor de e-mail

Sugestão mantida: **Resend** (`resend@6.26.0` na data desta revisão — versão a confirmar no momento da implementação real, `npm view resend version`). Nenhuma chave/credencial foi lida ou registrada. — a implementação de rascunho (§10) usa um `EmailSender` abstrato com um provedor de desenvolvimento (loga no console, nunca envia de verdade) para que o fluxo seja testável sem depender dessa decisão; a integração real com Resend (ou outro provedor escolhido) só entra depois que Jose decidir e fornecer a chave via variável de ambiente — nunca lida por mim.

Decisão José 04/09/2026 - A) Resend, mas deve ser utilizado abstração EmailSender e criar um arquivo de configuração para futuramente quando formos mudar o provedor de e-mail fora do ambiente de desenvolvimento alteraremos somente no arquivo de configuração com os dados do provedor. 

## 2. `prisma/schema.prisma` — modelos revisados

```prisma
enum AdminRole {
  ADMIN
  EDITOR
}

model AdminUser {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email        String    @unique
  name         String
  role         AdminRole @default(EDITOR)
  passwordHash String    @map("password_hash")
  active       Boolean   @default(true)
  tokenVersion Int       @default(0) @map("token_version")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  loginCodes    AdminLoginCode[]
  pendingLogins PendingLogin[]
  loginAttempts LoginAttempt[]

  @@map("admin_users")
}

model AdminLoginCode {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  adminUserId String    @map("admin_user_id") @db.Uuid
  codeHash    String    @map("code_hash")
  expiresAt   DateTime  @map("expires_at")
  consumedAt  DateTime? @map("consumed_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  adminUser AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)

  @@index([adminUserId])
  @@map("admin_login_codes")
}

// Novo: estado de MFA pendente do lado do servidor. O cookie do navegador
// carrega só o `id` (token opaco aleatório) desta linha — nunca adminUserId,
// role ou qualquer campo semântico. Ver §3.2.
model PendingLogin {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  adminUserId String    @map("admin_user_id") @db.Uuid
  expiresAt   DateTime  @map("expires_at")
  consumedAt  DateTime? @map("consumed_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  adminUser AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)

  @@index([adminUserId])
  @@map("pending_logins")
}

enum LoginAttemptResult {
  PASSWORD_INVALID
  CODE_INVALID
  CODE_EXPIRED
  SUCCESS
  BLOCKED
}

model LoginAttempt {
  id           String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  adminUserId  String?             @map("admin_user_id") @db.Uuid
  email        String
  ipHash       String              @map("ip_hash")
  deviceId     String?             @map("device_id")
  result       LoginAttemptResult
  blockedUntil DateTime?           @map("blocked_until")
  createdAt    DateTime            @default(now()) @map("created_at")

  adminUser AdminUser? @relation(fields: [adminUserId], references: [id], onDelete: SetNull)

  @@index([email])
  @@index([adminUserId])
  @@index([ipHash])
  @@index([deviceId])
  @@map("login_attempts")
}

// Novo: contadores atômicos de rate limit multi-dimensão. Uma linha por
// (dimension, key, context, windowStart); incremento atômico via SQL bruto
// (§3.1), nunca leitura+escrita separadas (evita corrida entre requisições
// simultâneas).
enum RateLimitDimension {
  EMAIL
  IP
  DEVICE
}

enum RateLimitContext {
  PASSWORD_STEP
  CODE_STEP
  CODE_SEND
}

model RateLimitCounter {
  id          String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  dimension   RateLimitDimension
  key         String
  context     RateLimitContext
  windowStart DateTime            @map("window_start")
  count       Int                 @default(0)
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")

  @@unique([dimension, key, context, windowStart])
  @@map("rate_limit_counters")
}
```

Notas de modelagem:

- Todos os IDs seguem o padrão da Fatia 4.2 (`dbgenerated("gen_random_uuid()")`), não `@default(uuid())`.
- `AdminLoginCode.codeHash`/`LoginAttempt.ipHash`: **corrigido** — deixam de ser `sha256(valor + pepper)` por concatenação e passam a ser HMAC-SHA256 com o pepper como chave (§7).
- `LoginAttempt.deviceId`: novo campo — cookie opaco aleatório, não é fingerprint (não deriva de user-agent/tela/fontes); ver §3.1.
- `AdminUser.tokenVersion`: novo campo — permite revogar sessões JWT já emitidas sem esperar expiração (§3.3).
- `LoginAttempt.adminUserId` continua opcional (tentativa com e-mail inexistente também é registrada, mitigação de enumeração de contas).
- Sem tabela `Account`/`Session`/`VerificationToken` — ver §1.3.

## 3. Fluxo de login proposto (revisado)

**Decisão confirmada por Jose em 04/09/2026 (substitui a suposição conservadora da revisão anterior deste documento — ver §3.4): quando um `AdminUser` tem `twoFactorEnabled=true`, o código TOTP do Google Authenticator/app equivalente SUBSTITUI o código por e-mail como segundo fator daquele login — não se soma a ele. Quem não ativou o TOTP continua exatamente no fluxo de código por e-mail (obrigatório) já aprovado em 01/09/2026.**

```text
1. POST /api/admin/login/password { email, password }
   → valida Origin/Referer (mesma origem; rejeita se ausente/diferente — CSRF, blocker 3)
   → garante cookie de dispositivo (fs_device_id, opaco, ver §3.1); cria se ausente
   → verifica rate limit (email + ip + device, contexto PASSWORD_STEP, §3.1); se estourado,
     responde 429 genérico e grava LoginAttempt(result=BLOCKED)
   → busca AdminUser por email; se não existir ou active=false, resposta genérica de erro
     (nunca revela se o e-mail existe) + LoginAttempt(result=PASSWORD_INVALID, adminUserId=null)
   → bcrypt.compare(password, passwordHash) [custo 12, ver §7]
       inválida → LoginAttempt(result=PASSWORD_INVALID); incrementa contadores
       válida   → cria PendingLogin (expiresAt = agora + 10min); responde com cookie
                  fs_pending_login = PendingLogin.id (HttpOnly, Secure em produção,
                  SameSite=Strict, Max-Age = 10min) — nunca adminUserId/email/role;
                  ramifica conforme AdminUser.twoFactorEnabled:

       twoFactorEnabled=false (padrão, fluxo já aprovado)
           → verifica rate limit de envio (email, contexto CODE_SEND, cooldown 60s);
             cria AdminLoginCode (hash HMAC, expiresAt = agora + 10min); envia código por
             e-mail (EmailSender, §10); resposta inclui { step: "email_code" }

       twoFactorEnabled=true (novo, §3.4)
           → NÃO cria AdminLoginCode, NÃO envia e-mail; resposta inclui { step: "totp" } —
             o app autenticador já tem o código, não depende de envio nenhum

2a. POST /api/admin/login/code { code }  — só quando step="email_code" (usa fs_pending_login
    e fs_device_id, nunca dado do body para identificar o usuário)
   → valida Origin/Referer
   → carrega PendingLogin pelo id do cookie; se ausente/expirado/consumido, erro genérico
   → se o AdminUser do PendingLogin tiver twoFactorEnabled=true, rejeita (usuário deve usar 2b)
   → verifica rate limit (email do AdminUser do PendingLogin + ip + device, contexto CODE_STEP)
   → localiza AdminLoginCode mais recente não consumido e não expirado do mesmo adminUserId
   → compara HMAC(code) em tempo constante (crypto.timingSafeEqual, §7)
       inválido/expirado → LoginAttempt(result=CODE_INVALID | CODE_EXPIRED); conta para o limite
       válido            → transação: marca AdminLoginCode.consumedAt + PendingLogin.consumedAt;
                           LoginAttempt(result=SUCCESS); chama signIn("credentials", { pendingLoginId,
                           code }) — authorize() RE-VALIDA tudo server-side a partir do banco
                           (nunca aceita um campo "verified" vindo do cliente, blocker 3); emite
                           JWT com { id, email, name, role, tokenVersion }

2b. POST /api/admin/login/totp { code }  — só quando step="totp" (mesmo padrão de cookies e
    de nunca confiar em id vindo do body; ver §3.4)
   → valida Origin/Referer
   → carrega PendingLogin pelo id do cookie; se ausente/expirado/consumido, erro genérico
   → se o AdminUser do PendingLogin tiver twoFactorEnabled=false, rejeita (usuário deve usar 2a)
   → verifica rate limit (email + ip + device, contexto TOTP_STEP)
   → descriptografa twoFactorSecretEncrypted; verifica código via otplib (RFC 6238, janela de
     ±1 passo de 30s)
       inválido → LoginAttempt(result=CODE_INVALID); conta para o limite
       válido   → transação: marca PendingLogin.consumedAt; LoginAttempt(result=SUCCESS);
                  chama signIn("credentials", { pendingLoginId, code }) — mesmo contrato de
                  authorize() re-validando tudo a partir do banco; emite JWT idêntico ao 2a
```

Bloqueio: cinco resultados não-`SUCCESS` (em qualquer etapa) para a mesma dimensão (`email`, `ip` ou `device`) dentro de 15 minutos gera `blockedUntil = agora + 15 minutos` para aquela dimensão específica; nenhuma tentativa nova é processada enquanto qualquer uma das três dimensões envolvidas estiver bloqueada, mesmo com credenciais corretas. Aviso ao próprio `AdminUser` bloqueado por e-mail (canal "todos os admins" fica para quando existir `InstitutionalSettings`, Fatia 4.5 — mesma redução de escopo já sinalizada na versão anterior).

### 3.1 Rate limiting multi-dimensão e atômico (endereça blocker 1)

- **Dimensões independentes**: `email`, `ipHash`, `deviceId` — falha em qualquer uma bloqueia aquela dimensão especificamente (ex.: 5 falhas do mesmo IP contra e-mails diferentes bloqueia o IP mesmo que nenhum e-mail individual tenha atingido 5).
- **Identificador de dispositivo preservando privacidade**: cookie `fs_device_id`, UUID v4 gerado com `crypto.randomUUID()`, `HttpOnly`, `Secure` em produção, `SameSite=Lax`, `Max-Age` 1 ano. É um token opaco de correlação, não um fingerprint (não deriva de user-agent, resolução de tela, fontes instaladas nem qualquer característica do navegador) — não permite reidentificar o dispositivo fora do próprio sistema, apenas correlacionar tentativas dentro dele.
- **Limites por etapa/contexto**: `RateLimitContext` separa `PASSWORD_STEP`, `CODE_STEP`, `CODE_SEND` e `TOTP_STEP` (§3.4) — um contexto estourado não bloqueia os outros (ex.: cooldown de reenvio de código não impede uma nova tentativa de senha com outro e-mail no mesmo IP, dentro do limite daquela dimensão/contexto; um `AdminUser` com TOTP nunca aciona `CODE_SEND`/`CODE_STEP`, pois esse fluxo não existe para ele).
- **Atomicidade contra corrida**: incremento via `INSERT ... ON CONFLICT (dimension, key, context, window_start) DO UPDATE SET count = rate_limit_counters.count + 1 RETURNING count` (SQL bruto via `$queryRaw`, não upsert do Prisma Client, que não é atômico sob concorrência). Duas requisições simultâneas do mesmo atacante nunca conseguem, juntas, ultrapassar o limite sem que pelo menos uma delas veja o contador já estourado.
- **Cooldown de envio** (`CODE_SEND`): no máximo 1 código novo por `AdminUser` a cada 60 segundos, verificado pelo mesmo mecanismo atômico (janela de 60s em vez de 15min).

### 3.2 MFA com prova exclusivamente server-side (endereça blocker 3)

- O `Credentials` provider do Auth.js (`authorize()`) recebe **apenas** `{ pendingLoginId, code }`. Nunca aceita `id`, `email`, `role` ou qualquer flag de "mfaVerified" vinda do cliente como prova de identidade — todo esse estado é recarregado do banco dentro de `authorize()` a partir do `pendingLoginId`.
- `PendingLogin` é a prova formal: estado temporário (expira em 10 minutos), de uso único (`consumedAt`), criado no passo 1 e consumido no passo 2, sempre no servidor.
- Cookie `fs_pending_login`: carrega só o UUID opaco do `PendingLogin` (não o `adminUserId` nem nada semântico), `HttpOnly`, `Secure` em produção, `SameSite=Strict` (mais restritivo que o `Lax` do cookie de dispositivo, pois carrega estado de autenticação em andamento), `Max-Age` = 10 minutos (mesmo prazo de expiração do `PendingLogin`/`AdminLoginCode`).
- Proteção CSRF: (a) os dois endpoints REST próprios (`/api/admin/login/password`, `/api/admin/login/code`) validam cabeçalho `Origin`/`Referer` contra a origem esperada da aplicação, rejeitando qualquer requisição cross-origin antes de tocar o banco; (b) a chamada final `signIn("credentials", …)` usa a proteção CSRF nativa do Auth.js (cookie/token de CSRF do próprio framework).

### 3.3 Revogação de sessão JWT (endereça blocker 2)

- `AdminUser.tokenVersion` (Int) incrementado sempre que `active` for desativado ou `role` mudar (e disponível para uma futura ação manual de "encerrar todas as sessões").
- O JWT emitido no login carrega `tokenVersion` junto com `id`/`role`.
- O callback `jwt` do Auth.js roda em toda requisição autenticada (não só no login) e revalida `active`/`role`/`tokenVersion` atuais do `AdminUser` no banco; se `active=false` ou `tokenVersion` do token não bater com o valor atual, o callback retorna `null`, forçando o fim da sessão mesmo com um JWT ainda criptograficamente válido.
- Trade-off documentado: isso troca um pouco da "estatelessness" pura de JWT por revogação imediata — decisão consciente, exigida pela política de segurança do projeto para um painel administrativo. `session.maxAge` reduzido para 8 horas (era implícito/padrão antes) para limitar a janela mesmo se a checagem de `tokenVersion` falhar por algum motivo não previsto.
- Testado explicitamente em §8 (revogação imediata após desativar usuário ou trocar `role`).

### 3.4 TOTP como segundo fator alternativo ao e-mail, opcional por usuário (`otplib`)

Adicionado a pedido do Jose em 04/09/2026 (mensagem com especificação completa de um fluxo TOTP/`otplib`); comportamento de substituição e ativação opcional **confirmados por Jose no mesmo dia** (ver decisões 1 e 2 abaixo — já não são mais suposição, são a regra desta fatia). Antes de propor qualquer coluna ou tabela nova, o schema/fluxo acima (§2, §3.1–§3.3) foi reanalisado para reuso — resumo do pedido de análise:

```text
ESTRUTURA ATUAL ENCONTRADA
- Framework: Next.js 16 (App Router, Route Handlers) + TypeScript
- Sistema de autenticação: Auth.js v5 (next-auth 5.0.0-beta.32), Credentials provider, sessão JWT
- Banco de dados: PostgreSQL (Docker local; provedor de produção a confirmar — §4)
- ORM: Prisma (^6.19.x)
- Tabela de usuários: AdminUser (já modelada nesta mesma fatia, ainda não commitada)
- Campos existentes relacionados à autenticação: passwordHash, active, tokenVersion, role
- Sistema de sessão: JWT (Auth.js), com revogação via tokenVersion (§3.3)
- Já existe MFA: sim — código de 6 dígitos por e-mail, obrigatório para todo AdminUser (§3.2),
  com PendingLogin (estado server-side de segundo fator), AdminLoginCode, LoginAttempt,
  RateLimitCounter — toda a infraestrutura de estado temporário, rate limit e auditoria de
  tentativa que um segundo fator TOTP também precisaria já existe e será reutilizada, não
  duplicada.
- Estruturas reutilizáveis para TOTP: AdminUser (adiciona colunas, não cria tabela de usuário
  nova), PendingLogin (mesmo estado temporário serve para "aguardando código TOTP" com um novo
  campo de tipo de etapa), RateLimitCounter (novo RateLimitContext), LoginAttempt (novo
  LoginAttemptResult), env.ts (padrão já existente para exigir variável de ambiente obrigatória
  no boot).

PLANO DE IMPLEMENTAÇÃO
- Alterações necessárias: estender AdminUser com 3 colunas (abaixo); PendingLogin não precisa de
  coluna nova — qual etapa esperar (e-mail ou TOTP) é sempre derivado de AdminUser.twoFactorEnabled
  no momento da leitura, nunca duplicado/guardado de novo (evita os dois campos divergirem); novos
  valores em RateLimitContext e LoginAttemptResult (reuso do mesmo mecanismo de bloqueio).
- Novas colunas em AdminUser: twoFactorEnabled (Boolean, default false), twoFactorSecretEncrypted
  (String?, cifrado — nunca em texto puro, nunca hash irreversível), twoFactorVerifiedAt (DateTime?).
- Nova tabela (necessária — não há estrutura de token de uso único reutilizável no schema atual):
  AdminRecoveryCode (id, adminUserId, codeHash, usedAt, createdAt) — mesmo padrão de
  AdminLoginCode (hash, não texto puro; uso único via usedAt).
- Arquivos a criar: `src/lib/auth/totp.ts` (geração de secret/URI, verificação via `otplib`),
  `src/lib/auth/totp-encryption.ts` (AES-256-GCM, chave de `TOTP_ENCRYPTION_KEY`),
  `src/lib/auth/recovery-codes.ts` (gerar/hash/verificar/regenerar 10 códigos), rotas
  `src/app/api/admin/2fa/setup/route.ts`, `.../confirm/route.ts`, `.../disable/route.ts`,
  `.../recovery-codes/regenerate/route.ts`, `src/app/api/admin/login/totp/route.ts` (etapa de
  login quando `twoFactorEnabled=true`).
- Arquivos a modificar: `prisma/schema.prisma` (colunas/tabela acima), `src/lib/auth/config.ts`
  (authorize() passa a checar twoFactorEnabled antes de emitir sessão), `src/lib/auth/env.ts`
  (nova `requireTotpEncryptionKey()`).
```

**Decisões de fluxo — confirmadas por Jose em 04/09/2026** (eram regra de negócio/arquitetura de segurança, corretamente não assumidas sozinho — `CLAUDE.md` §11; a proposta anterior tinha um padrão conservador diferente, substituído abaixo pela decisão real do Jose):

1. **TOTP substitui o código por e-mail — CONFIRMADO.** Motivo dado por Jose: exigir senha + e-mail + TOTP no mesmo login (três etapas, copiar código de dois lugares diferentes) é atrito desproporcional ao ganho de segurança para um painel administrativo interno. Quando `twoFactorEnabled=true`, a etapa de e-mail (`AdminLoginCode`, envio, `/api/admin/login/code`) simplesmente não roda para aquele `AdminUser` — `/api/admin/login/totp` (2b acima) ocupa o lugar dela, com o mesmo contrato de segurança do §3.2 (`authorize()` nunca confia em prova vinda do cliente). Continua havendo exatamente dois fatores (senha + um segundo fator), nunca um só — a troca é *qual* segundo fator, não a existência dele.
2. **Ativação opcional/self-service — CONFIRMADO**, com a mesma justificativa do Jose: permite testar o TOTP sem risco de bloquear ninguém, sem forçar configuração antes de existir uma tela para isso. `twoFactorEnabled` nasce `false` para todo `AdminUser` (inclusive o seed inicial, §10); cada admin ativa via `/api/admin/2fa/setup` → escaneia QR → confirma o primeiro código → só então `twoFactorEnabled=true`. Sem tela de configuração nesta fatia (§1.2 — esta fatia é só back-end, sem UI nova); os endpoints ficam prontos para uma UI futura consumir. Tornar o TOTP obrigatório para todos fica registrado como decisão futura possível, não implementada aqui.

Pontos do fluxo pedido já cobertos pela infraestrutura desta fatia, sem duplicar nada:

- **Secret nunca em texto puro nem hash irreversível**: `twoFactorSecretEncrypted` cifrado com AES-256-GCM (`crypto` nativo do Node), chave em `TOTP_ENCRYPTION_KEY` (variável de ambiente nova, nunca no repositório, nunca enviada ao navegador) — diferente do padrão HMAC de `MFA_CODE_PEPPER` (§7), que é intencionalmente irreversível; aqui precisa ser reversível para validar códigos futuros, exatamente como o pedido descreve.
- **Não ativa antes da primeira confirmação**: `twoFactorEnabled` só vira `true` depois de um código TOTP válido no fluxo de setup (nunca no momento em que o secret é gerado).
- **Estado temporário de login com TOTP pendente**: reaproveita `PendingLogin` (já expira em janela curta, já é de uso único, já não é identificável pelo cliente) em vez de criar um mecanismo novo de "pending_2fa_authentication".
- **Rate limiting**: novo `RateLimitContext.TOTP_STEP`, mesmo mecanismo atômico multi-dimensão do §3.1 (não uma proteção "simples" à parte).
- **Recovery codes**: 10 códigos, exibidos uma única vez no momento da geração (responsabilidade do endpoint, não persistida em texto puro em lugar nenhum), armazenados só como hash (`AdminRecoveryCode.codeHash`, mesmo padrão HMAC de `AdminLoginCode`), uso único (`usedAt`), regeneração exige um código TOTP válido antes de invalidar os antigos.
- **Desativar 2FA**: exige senha atual **e** (código TOTP válido **ou** um recovery code válido) antes de zerar `twoFactorSecretEncrypted`/`twoFactorEnabled` e invalidar todos os recovery codes restantes — registrado como novo `LoginAttemptResult` (`TWO_FACTOR_DISABLED`) para auditoria, reaproveitando `LoginAttempt`.
- **Sem SMS, sem e-mail, sem serviço pago**: `otplib` gera/valida localmente (RFC 6238, 6 dígitos, janela de 30s), sem dependência de provedor externo — ortogonal à decisão pendente do provedor de e-mail (§1.4), que continua servendo só o primeiro MFA (código por e-mail).
- **QR code**: gerado no backend a partir da URI `otpauth://totp/FortSulSC:{email}?secret=...&issuer=FortSulSC`; nenhuma biblioteca de QR existe hoje no projeto — proposta usar `qrcode` (a confirmar versão exata via `npm view qrcode version` no momento da implementação), única dependência nova além de `otplib`.
- **Nenhum dado sensível em log**: secret (cifrado ou não), código TOTP, recovery code em texto puro e `TOTP_ENCRYPTION_KEY` nunca passam por `console.*`/logger, mesmo padrão já testado em §8.2 para o MFA por e-mail.

Testes adicionais (mesmo arquivo/padrão do §8.2, novo arquivo `src/lib/auth/__tests__/totp.test.ts` e `recovery-codes.test.ts`): secret gerado com entropia adequada; secret cifrado/decifrado corretamente (round-trip); URI compatível com RFC 6238; código válido aceito, inválido rejeitado, fora da janela de tempo rejeitado; login sem 2FA continua funcionando sem alteração; login com 2FA não emite sessão antes da validação do TOTP; recovery code válido funciona uma vez e falha na segunda tentativa; desativação exige senha + segundo fator.

## 4. Banco de dados — menor privilégio (endereça parte do blocker 5)

- Nova migração cria uma role de aplicação dedicada `fortsul_app` (sem `SUPERUSER`, sem `CREATEDB`, sem `CREATEROLE`), com `GRANT SELECT, INSERT, UPDATE, DELETE` apenas nas tabelas de domínio (não `ALL PRIVILEGES`, não acesso a `information_schema`/catálogos além do necessário para o driver).
- `DATABASE_URL` da aplicação (runtime) deve usar `fortsul_app`; a migração (`prisma migrate deploy`) continua usando a role "dona" do schema (owner), documentada como `DATABASE_URL_MIGRATE`, variável separada em `.env.example` — nunca a mesma usada em produção pela aplicação.
- Decisão José 04/09/2026 - O PostgreSQL de produção será o Supabase. CREATE ROLE, GRANT e RLS deverão ser configurados no Supabase/PostgreSQL, não na Vercel. Manter uma role dedicada fortsul_app com privilégio mínimo para o runtime e uma credencial separada de owner/migration para migrations.: esta migração assume que a role de aplicação pode ser criada com `CREATE ROLE` a partir da role dona (padrão no Postgres local via Docker Compose). Se o provedor de Postgres em produção (marketplace da Vercel) não permitir `CREATE ROLE` pela conexão disponível, essa etapa precisa ser adaptada ao mecanismo de usuários daquele provedor — Jose precisa confirmar isso antes do deploy em produção; não assumo silenciosamente que funciona igual em produção.
- Acesso direto anônimo: já não existe (porta do `db` não é publicada no host, decisão já registrada nas Fatias 4.1/4.2); esta migração reforça isso no nível do próprio Postgres (role, não só rede).

## 5. RLS deny-by-default (endereça o restante do blocker 5)

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + `ALTER TABLE ... FORCE ROW LEVEL SECURITY` nas tabelas de maior sensibilidade: `admin_users`, `admin_login_codes`, `pending_logins`, `login_attempts`, `rate_limit_counters`, `partner_private`.
- Sem nenhuma `POLICY`, o Postgres nega tudo por padrão a qualquer role — inclusive à role dona, exceto quando dona = superuser (que ignora RLS por padrão; por isso a aplicação **não** deve rodar como a role dona/owner).
- Uma única `POLICY` permissiva (`USING (true) WITH CHECK (true)`) concedida explicitamente `TO fortsul_app` nessas tabelas — a autorização real continua sendo feita em código (RBAC `ADMIN`/`EDITOR`, verificação de sessão), RLS aqui é defesa em profundidade: se uma outra role (ex.: uma futura conexão de BI/analytics/read-replica) for criada sem querer com acesso a essas tabelas, ela não lê nada até ganhar uma política própria e deliberada.
- Testado em §8: uma conexão com uma role sem policy não consegue ler nenhuma linha dessas tabelas, mesmo com `SELECT` concedido a nível de tabela.

## 6. Retenção e LGPD (endereça blocker 4)

- `PendingLogin`/`AdminLoginCode`: retenção curta — linhas consumidas ou expiradas há mais de 24 horas são elegíveis para expurgo (janela curta o suficiente para investigar um incidente recente, sem acumular códigos/estado de MFA desnecessariamente).
- `LoginAttempt`/`RateLimitCounter`: retenção de 1 ano (decisão já registrada na Fase 3), depois elegíveis para expurgo. `ipHash`/`deviceId` continuam pseudonimizados, não anônimos — tratados como dado pessoal enquanto existirem, inclusive durante a janela de retenção.
- Rotina: `scripts/purge-security-data.ts` (roda via `npm run purge:security`), idempotente, delete em lote por tabela/janela acima, sem tocar em nenhuma tabela de domínio público (catálogo, parceiros). Não inclui agendamento automático nesta fatia — **fica registrado como obrigação para Jose configurar um disparo externo**
- Decisão José 04/09/2026 - Não incluir implementação própria de backup na Fatia 4.3. Utilizar o mecanismo de backup do provedor PostgreSQL/Supabase e registrar a validação de backup e restauração como requisito obrigatório antes da entrada em produção.

 (ex.: Vercel Cron via `vercel.ts`, ou execução manual periódica) já que isso é uma decisão de infraestrutura/deploy, não uma decisão técnica que eu deva tomar sozinho.
- Restauração/backup: sem rotina de backup própria criada nesta fatia (seria uma decisão de infraestrutura maior, fora do escopo desta fatia de autenticação) — fica registrado como gap a resolver com Jose antes de haver dado real de produção nessas tabelas.
- Termos de Uso / Política de Privacidade: continuam ausentes do projeto — ver §1.2, não fabricado aqui.

- Decisão José 04/09/2026 -  Aprovado agendamento automático diário da rotina de expurgo. A execução não deverá depender de intervenção manual e deverá respeitar as janelas de retenção definidas na proposta.

## 7. Criptografia — contrato preciso (endereça blocker 6)

- Senha: `bcryptjs` (`^3.0.3`), custo (`saltRounds`) fixo em **12**. Política de tamanho: mínimo 12 caracteres, máximo 128 — validado **antes** de chamar `bcrypt.hash`/`bcrypt.compare` (bcrypt trunca silenciosamente em 72 bytes; validar tamanho antes evita esse comportamento surpreendente e limita custo de CPU de entradas artificialmente grandes).
- Código de 6 dígitos: `crypto.randomInt(0, 1_000_000)` (CSPRNG nativo do Node, não `Math.random`), formatado com zero-padding para sempre ter 6 caracteres.
- Hash do código e do IP: `HMAC-SHA256(valor, pepper)` via `crypto.createHmac('sha256', pepper)` — **corrigido**: a versão anterior desta proposta descrevia `sha256(valor + pepper)` por concatenação, vulnerável a ataques de extensão de comprimento em teoria e sem a garantia formal de um HMAC. Pepper lido de `MFA_CODE_PEPPER` (variável de ambiente, nunca no repositório), obrigatório no boot em produção (a aplicação falha ao subir se ausente, em vez de operar sem proteção).
- Comparação: sempre em tempo constante (`crypto.timingSafeEqual` sobre os buffers do HMAC, nunca `===`/`.includes` sobre o valor em texto puro ou o hash).
- Tudo coberto por testes de unidade dedicados (§8.2).

## 8. Contrato de testes (código) — expandido (endereça blocker 7)

### 8.1 Contrato de banco — `src/lib/db/__tests__/fatia-4-3.integration.test.ts`

Mesmo padrão hermético das Fatias 4.1/4.2, rodando contra o Postgres do `db` via `docker compose exec app npm run test:db`. Além dos casos já descritos na versão anterior (unicidade de e-mail, defaults, cascade de `AdminLoginCode`, `adminUserId` nulo em `LoginAttempt`, `SetNull` ao excluir usuário, todos os valores de `result`, `blockedUntil` futuro), a revisão adiciona:

- `PendingLogin` nasce não consumido, vinculado a um `AdminUser`, e é removido em cascata ao excluir o usuário.
- `RateLimitCounter` respeita a constraint única `(dimension, key, context, windowStart)` — uma segunda tentativa de `create` com a mesma combinação falha (a atomicidade real é testada via `$queryRaw`, não via `create`, ver caso de concorrência abaixo).
- Incremento atômico via `$queryRaw` do `RateLimitCounter`: disparar 10 incrementos concorrentes (`Promise.all`) para a mesma chave e confirmar que o contador final é exatamente 10 (sem perda por corrida).
- RLS: uma conexão Postgres separada, autenticada como uma role sem `POLICY` própria nas tabelas de segurança, não retorna nenhuma linha de `admin_users`/`admin_login_codes`/`pending_logins`/`login_attempts`/`rate_limit_counters` mesmo com `GRANT SELECT` de tabela concedido.
- `AdminUser.tokenVersion` incrementa ao mudar `active` para `false` (via trigger de aplicação/serviço, testado na camada de unidade — ver 8.2 — não no schema puro).

### 8.2 Contrato de aplicação — testes de unidade (sem banco, sem e-mail real)

Arquivos: `src/lib/auth/__tests__/crypto.test.ts`, `rate-limit.test.ts`, `lockout.test.ts`, `pending-login.test.ts`, `session.test.ts`, cobrindo com mocks:

- **Erro indistinguível**: e-mail inexistente, e-mail inativo (`active=false`) e senha inválida para e-mail existente produzem exatamente a mesma resposta HTTP (status, corpo, timing dentro de uma margem que não vaza informação por diferença grosseira de tempo de resposta).
- **Rate limit por dimensão**: 4 falhas não bloqueia; a 5ª bloqueia só a dimensão (email/ip/device) que atingiu o limite, sem afetar as outras duas; uma falha fora da janela de 15 minutos não conta para o total; cooldown de 60s do `CODE_SEND` é respeitado independentemente do contador de falhas.
- **Concorrência**: duas requisições simultâneas de rate limit para a mesma chave nunca deixam o contador ultrapassar o limite sem que ambas vejam o estado já bloqueado (mock do incremento atômico simulando corrida).
- **Reuso/expiração de código**: código correto e não expirado passa; código correto porém expirado falha; código incorreto falha; código já consumido falha mesmo dentro da validade.
- **`authorize()` do Credentials provider**: só retorna usuário quando recebe um `pendingLoginId` válido + `code` correspondente already validados a partir do banco — rejeita qualquer tentativa de passar `role`/`email`/`id`/flag de verificação diretamente, mesmo que tecnicamente presentes no payload de entrada (o provider os ignora, não os usa como fonte de verdade).
- **Nenhum vazamento de hash/cookie**: resposta HTTP de nenhum endpoint de login inclui `passwordHash`, `codeHash` ou o valor do `pendingLoginId` fora do cookie `Set-Cookie` (nunca no corpo JSON).
- **CSRF**: requisição para `/api/admin/login/password` e `/api/admin/login/code` sem `Origin`/`Referer` correspondente à origem esperada é rejeitada antes de qualquer acesso ao banco.
- **Acesso anônimo**: uma chamada simulando rota administrativa protegida sem sessão válida retorna 401/redirect, nunca dado.
- **RBAC**: helper de autorização distingue `ADMIN` de `EDITOR` corretamente para uma operação hipotética restrita a `ADMIN` (contrato mínimo reutilizável pela Fatia 4.4).
- **Revogação de sessão**: token com `tokenVersion` desatualizado ou `AdminUser.active=false` é rejeitado pelo callback `jwt`, mesmo sendo um JWT válido/não expirado.
- **Logout**: endpoint de logout limpa o cookie de sessão e não deixa nenhum estado de `PendingLogin` pendente utilizável depois.
- **Logs sem dado sensível**: nenhuma chamada de log (mock de `console.*`/logger) inclui senha, código em texto puro, hash ou pepper em nenhum teste acima (asserção negativa cruzando todos os casos).

Este arquivo de teste de unidade deve existir e passar (`npm run test:unit`) antes de a fatia ser considerada concluída, no mesmo nível de exigência do contrato de banco.

## 9. Dependências e deploy (endereça blocker 8)

- `next-auth@5.0.0-beta.32` (versão exata na data desta revisão — reconfirmar com `npm view next-auth@beta version` no momento real da implementação, já que é beta e recebe releases com frequência).
- `bcryptjs@3.0.3` (exata).
- `otplib` e `qrcode` (TOTP, §3.4) — versões exatas a fixar via `npm view otplib version` / `npm view qrcode version` no momento da implementação real; nenhuma delas está instalada no rascunho atual (§10) até esta seção ser aprovada.
- Provedor de e-mail: versão a fixar quando Jose decidir o provedor (§1.4); sugestão `resend@6.26.0` como referência atual.
- `npm audit --omit=dev` deve rodar como gate antes de qualquer deploy desta fatia, com o mesmo padrão já usado para `deepmerge-ts` (3 vulnerabilidades altas conhecidas, sem fix não-breaking disponível, já auditadas e aceitas como risco residual documentado) — qualquer vulnerabilidade nova introduzida por `next-auth`/`bcryptjs`/provedor de e-mail deve ser avaliada antes do merge, não silenciosamente ignorada.
- `package.json`/`docker-compose.yaml`/`Dockerfile`: sem mudança estrutural além das dependências acima — mesma base da Fatia 4.1/4.2. Variáveis novas em `.env.example`: `AUTH_SECRET`, `MFA_CODE_PEPPER`, `DATABASE_URL_MIGRATE`, chave do provedor de e-mail (a definir).

## 10. Como rodar / estado do rascunho

Existe um rascunho de implementação desta proposta revisada em branch/worktree isolado do Claude (`feature/claude-fatia-4-3-auth-security`), **sem nenhum commit, merge ou push** — nada chega à `main` a partir desse rascunho sem passar pelo fluxo abaixo. O rascunho existe para dar a Jose código real para revisar junto com esta proposta, não para pular etapas do fluxo de aprovação.

```bash
docker compose up -d
docker compose exec app npx prisma migrate dev --name fatia_4_3_admin_auth_security
docker compose exec app npx prisma db seed   # cria o AdminUser inicial a partir de variável de ambiente
docker compose exec app npm run test:db
docker compose exec app npm run test:unit
docker compose exec app npm run typecheck
docker compose exec app npm audit --omit=dev
```

Seed do `AdminUser` inicial: senha lida de `ADMIN_SEED_PASSWORD`, só na primeira execução, nunca escrita no código-fonte; se a variável não existir, o seed pula a criação do admin.

## 11. Validações automatizadas e manuais

Automatizadas: `docker compose config --quiet`, `prisma validate`, `prisma migrate dev`, `npm run test:db` (§8.1), `npm run test:unit` (§8.2), `typecheck`, `next build`, `npm audit --omit=dev`.

Manuais, a cargo de Jose: (a) confirmar as duas decisões pontuais (§1.3 sem `PrismaAdapter`, §1.4 provedor de e-mail); (b) validar o fluxo completo de login (senha → código por e-mail → sessão) em ambiente local; (c) validar bloqueio por tentativas nas três dimensões; (d) validar revogação de sessão (desativar um `AdminUser` logado e confirmar que a sessão morre antes da expiração natural do JWT); (e) confirmar se o provedor de Postgres de produção permite `CREATE ROLE`/RLS como desenhado em §4/§5, ou se precisa adaptação; (f) decidir/agendar a rotina de expurgo (§6); (g) suíte de testes a partir da `main` pendente da Fatia 4.2 (§0, herdada da versão anterior).

- Decisão José 04/09/2026 - “Manter a Fatia 4.3 como uma única entrega de autenticação segura. Não criar uma versão intermediária utilizável apenas com senha. MFA, rate limiting e revogação de sessão devem fazer parte da mesma entrega antes do merge para produção.”

## 12. Riscos

- **Maior risco de segurança do projeto até agora**: mitigado com MFA obrigatório, rate limiting multi-dimensão atômico, revogação de sessão, RLS deny-by-default, criptografia com contrato preciso — mas nenhuma dessas camadas substitui a revisão humana do código real antes do merge.
- **Dependência de provedor de e-mail externo** — sem isso, o segundo fator não pode ser entregue em produção; o rascunho usa um provedor de desenvolvimento (console) para não bloquear a revisão técnica.
- **RLS/role dedicada em produção depende do provedor de Postgres** — risco de a etapa precisar de adaptação fora do meu controle (§4); sinalizado, não escondido.
- **Escopo grande para uma fatia só** — mantida a mesma oferta da versão anterior: se Jose preferir, quebro em 4.3a (schema + login só com senha) e 4.3b (MFA), mas a proposta acima já está completa como fatia única.
- Sem página de "esqueci minha senha" — perda de acesso exige intervenção manual direta no banco (processo interno, documentar, não implementar aqui).
- Termos de Uso/Política de Privacidade ausentes do projeto — gap formal, não bloqueia esta fatia (sem UI pública), mas bloqueia lançamento público do admin.

## 13. Bloco de status

Status: **PROPOSTA TÉCNICA REVISADA — AGUARDANDO APROVAÇÃO EXPLÍCITA DO JOSE**, incluindo duas decisões pontuais ainda abertas: (1) não usar `PrismaAdapter` (§1.3); (2) provedor de e-mail (§1.4, sugestão: Resend). A terceira decisão (TOTP substitui o e-mail quando ativado, ativação opcional/self-service, §3.4) **já foi confirmada por Jose em 04/09/2026**. Um rascunho de implementação existe em `feature/claude-fatia-4-3-auth-security` (worktree isolado, sem commit/push) para acompanhar esta revisão — **o rascunho ainda cobre só a versão sem TOTP (§1–§9, §11); os arquivos de §3.4 (TOTP) ainda não foram escritos no rascunho**, entram na próxima rodada de implementação agora que a decisão de fluxo está confirmada.

Fluxo a partir daqui:
1. Jose revisa esta proposta revisada e o rascunho de código, aprova (ou ajusta) o modelo e as duas decisões pontuais;
2. delegação ao `scope-gate-reviewer` sobre o rascunho antes de qualquer commit (`CLAUDE.md` §3.1.6) — ainda não executada nesta revisão, ver handoff separado;
3. ajustes finais no rascunho conforme Jose e o `scope-gate-reviewer`;
4. revisão técnica final do Claude do código real, com atenção especial a: nenhum vazamento de `passwordHash`/`codeHash`/pepper em resposta de API, nenhuma rota admin exposta sem verificação de sessão, comparação de senha/código sempre no servidor, RLS realmente ativo;
5. commit, merge e push exclusivamente com o Jose, seguido da suíte de testes a partir da `main` (§6.3 do contrato de agentes).

Referência completa do modelo geral da Fase 3: `docs/Proposta_Tarefa_4_Fase3_Modelagem.md`. Auditoria original: memória `project_fatia_4_3_security_audit`.
