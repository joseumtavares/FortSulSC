# Variáveis da Vercel + Supabase — modelo seguro

## Como copiar este modelo para o arquivo .env

Copie somente as linhas `NOME=valor` e os comentários iniciados por `#`.
As linhas com três crases (como a abertura de bloco `env`) e os textos fora
dos blocos pertencem a esta documentação; não devem ser colados no `.env`.

Na URL PostgreSQL, caracteres especiais da senha precisam de codificação
percentual. Por exemplo, `@`, `#`, `$` e `%` tornam-se `%40`, `%23`, `%24`
e `%25`. Codifique somente a senha, uma única vez, preservando a estrutura
da URL. Isso não troca a senha do banco: apenas permite representá-la na URL.
Referência: [URLs de conexão do Prisma](https://www.prisma.io/docs/orm/reference/connection-urls).

Uma URL válida não garante que a senha esteja correta. `empty host` indica
formato inválido; `Authentication failed` indica credenciais rejeitadas pelo
banco. Se a URL aponta para Supabase, iniciar o Docker local não altera essa
conexão. O Compose local exige suas próprias variáveis `POSTGRES_*`.

Antes de executar migrations, seed ou testes de integração, confira o banco
de destino. Os testes de integração deste projeto criam e removem registros;
use um banco exclusivo para testes. `SELECT 1` serve para verificar a conexão
sem alterar registros.

Este arquivo é um guia. Ele não contém chaves reais.

## Antes de começar

1. Crie novos segredos, porque os anteriores foram expostos.
2. Copie as URLs novamente no Supabase.
3. Cadastre cada variável em **Vercel → Settings → Environment Variables**.
4. Marque o ambiente **Preview**.
5. Nunca coloque estes valores no GitHub ou neste arquivo.

## Banco de dados

```env
# O banco está hospedado no Supabase.
DATABASE_PLATFORM=supabase

# O projeto usa PostgreSQL com Prisma.
DATABASE_PROVIDER=postgresql

# Cole aqui a URL "shared transaction-mode pooler".
# Deve ser a URL da porta 6543 e normalmente contém pgbouncer=true.
DATABASE_URL="COLE_A_URL_TRANSACTION_POOLER_AQUI"

# Cole aqui a URL que o Supabase chama de DIRECT_URL.
# No nosso projeto, o nome correto é DATABASE_URL_MIGRATE.
# Use a URL da porta 5432 para migrations e seed.
DATABASE_URL_MIGRATE="COLE_A_URL_SESSION_POOLER_AQUI"
```

A senha dentro da URL precisa estar correta. Para evitar erros, prefira uma
senha do banco formada apenas por letras e números. Não deixe
`[YOUR-PASSWORD]` na URL e não mantenha uma segunda linha `DATABASE_URL`.

## Autenticação

```env
# Use a URL HTTPS exata do Preview. Não coloque barra no final.
AUTH_ORIGIN=https://SEU-PROJETO.vercel.app

# Gere um segredo novo e exclusivo para este ambiente.
AUTH_SECRET="COLE_UM_SEGREDO_NOVO_AQUI"

# Gere outro segredo diferente para proteger os códigos MFA.
MFA_CODE_PEPPER="COLE_OUTRO_SEGREDO_NOVO_AQUI"

# A Vercel usa HTTPS e pode confiar no host configurado.
AUTH_TRUST_HOST=true

# Cookies seguros são obrigatórios no endereço HTTPS.
AUTH_COOKIE_SECURE=true

# HSTS deve ficar ativo no Preview HTTPS.
SECURITY_HEADERS_HSTS=true

# Mantenha false até existir uma decisão específica para confiar no proxy.
TRUST_PROXY_HEADERS=false
```

Para gerar cada segredo, execute o comando duas vezes no PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Use uma saída para `AUTH_SECRET` e a outra para `MFA_CODE_PEPPER`.

## Resend

```env
# O fluxo de autenticação envia códigos pelo Resend.
EMAIL_PROVIDER=resend

# Crie uma chave nova no painel do Resend.
RESEND_API_KEY="COLE_A_CHAVE_NOVA_DO_RESEND_AQUI"

# Para teste, onboarding@resend.dev pode ser usado se permitido pelo Resend.
# Para produção, use um remetente de domínio verificado.
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## O que não colocar aqui

Não adicione `DIRECT_URL`, `SUPABASE_SECRET_KEY`, `VERCEL_OIDC_TOKEN` ou
senhas do PostgreSQL local neste bloco. O projeto atual usa Prisma diretamente
e precisa apenas de `DATABASE_URL` e `DATABASE_URL_MIGRATE` para o banco.
