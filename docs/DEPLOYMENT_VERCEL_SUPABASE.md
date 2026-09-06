# Deploy de teste: Vercel + Supabase + Resend

Este projeto usa Prisma com um schema PostgreSQL. A configuração foi separada
para que o host possa mudar sem alterar as regras de negócio:

- `DATABASE_PLATFORM=local` usa o PostgreSQL do Docker Compose.
- `DATABASE_PLATFORM=supabase` usa o PostgreSQL hospedado no Supabase.
- `DATABASE_URL` é a conexão de runtime da aplicação.
- `DATABASE_URL_MIGRATE` é a conexão direta, usada somente por migrations e
  ferramentas administrativas.

## Por que existem duas URLs?

No Supabase, a aplicação deve usar a URL do pooler (Supavisor), pois a Vercel
cria várias instâncias e a conexão agrupada evita esgotar o limite do banco.
Migrations não devem usar o pooler: use a conexão direta do Supabase. Nunca
coloque nenhuma dessas URLs em `NEXT_PUBLIC_*` ou no código-fonte.

## Preparar o Supabase

1. Crie um projeto no painel do Supabase.
2. Em **Connect**, copie a conexão do pooler para uso da aplicação e a
   conexão direta para migrations.
3. Guarde ambas apenas no gerenciador de variáveis da Vercel e no arquivo
   `.env` local, que não é versionado.
4. Não copie a senha do banco para o chat, documentação ou SecondBrain.

Depois das migrations, defina uma senha exclusiva para a role `fortsul_app`
no SQL Editor do Supabase. Use um gerador de senhas e substitua o marcador
abaixo apenas no editor; nunca versionar este comando preenchido:

```sql
ALTER ROLE fortsul_app WITH LOGIN PASSWORD '<senha-forte-gerada-localmente>';
```

O pooler do Supabase deve usar essa role no `DATABASE_URL` de runtime. A URL
direta de `DATABASE_URL_MIGRATE` continua usando a credencial administrativa
do projeto e não deve ser usada pelo app.

## Variáveis na Vercel

Em **Project Settings → Environment Variables**, crie para o ambiente de
preview:

```text
DATABASE_PROVIDER=postgresql
DATABASE_PLATFORM=supabase
DATABASE_URL=<URL do pooler do Supabase>
DATABASE_URL_MIGRATE=<URL direta do Supabase>
AUTH_ORIGIN=<URL HTTPS do preview ou domínio configurado>
AUTH_TRUST_HOST=true
AUTH_SECRET=<segredo aleatório longo, exclusivo deste ambiente>
MFA_CODE_PEPPER=<segredo aleatório longo, exclusivo deste ambiente>
AUTH_COOKIE_SECURE=true
SECURITY_HEADERS_HSTS=true
TRUST_PROXY_HEADERS=false
EMAIL_PROVIDER=resend
RESEND_API_KEY=<chave criada no Resend, somente na Vercel>
RESEND_FROM_EMAIL=<remetente de domínio verificado>
```

`POSTGRES_*`, `ADMIN_SEED_*` e `DATABASE_URL_MIGRATE` não devem ser expostas
ao navegador. O seed deve ser executado separadamente, usando a URL direta,
antes de testar o login no preview.

## Imagens

O contrato do projeto permanece o aprovado: o PostgreSQL guarda somente
`image_url`, `image_key`, `mime_type` e `size`. As imagens não são gravadas no
banco. Para produção, o storage definido é Cloudflare R2 servido pelo próprio
Next.js; os arquivos atuais em `public/image` continuam sendo assets estáticos.
Não adicione um SDK ou uma troca para Supabase Storage sem uma decisão própria.

## Ordem segura do primeiro deploy

1. Criar as variáveis acima na Vercel, sem imprimir valores nos logs.
2. Fazer o build/deploy do preview.
3. Executar migrations com `DATABASE_URL_MIGRATE` apontando para o Supabase.
4. Executar o seed do administrador por um ambiente controlado.
5. Testar a home e o fluxo MFA no domínio HTTPS do preview.
6. Repetir os testes de CSRF, rate limit, replay e headers no preview.

## Pendência de segurança do Supabase

O advisor do Supabase sinalizou RLS desabilitado nas tabelas públicas de
catálogo e parceiros. A migration ativa RLS somente nas tabelas sensíveis para
preservar o comportamento do backend Prisma. Antes de expor qualquer tabela
via cliente Supabase/PostgREST, decidir as políticas de leitura/escrita e
habilitar RLS nas tabelas correspondentes. Não use a chave `service_role` no
navegador e não trate a ausência de políticas como uma autorização.

O merge, commit, push e a criação do projeto Vercel/Supabase são ações
manuais do proprietário do repositório; este documento não executa nenhuma
delas.
