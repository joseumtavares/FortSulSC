# Proposta — Migração do FortSulSC da Vercel para VPS própria

> Documento de planejamento. Nenhuma etapa aqui foi executada — é um checklist para conduzir a migração quando Jose decidir prosseguir. Atualizar o status de cada item conforme for concluído. Registrar a decisão final e o resultado no `PLANO_MESTRE_FORTSULSC.md` ao final.

## 0. Decisões antes de começar

- [ ] **Banco de dados**: manter PostgreSQL (recomendado, zero mudança de código) ou migrar para MySQL (ver análise abaixo — exige reescrever `src/lib/auth/rate-limit.ts` e ajustar 41 campos `@db.Uuid` + 16 usos de `gen_random_uuid()` no `schema.prisma`)?
- [ ] **Provedor de VPS**: definir (Hetzner, DigitalOcean, Contabo, Hostinger VPS, etc.) e o tamanho (depende de quantos sites/clientes vão rodar na mesma máquina — cada site Next.js + Postgres consome RAM; recomendo começar com no mínimo 4 GB RAM / 2 vCPU para o FortSulSC sozinho, mais margem por cliente adicional).
- [ ] **Camada de PaaS auto-hospedado**: Coolify, CapRover ou Dokku. Recomendo **Coolify** — mais recente, suporta Next.js/Docker nativamente, TLS automático via Let's Encrypt, interface de gerenciamento de múltiplos projetos/domínios (bom para revender hospedagem a outros clientes).
- [ ] **Domínio próprio**: hoje o site está em `fort-sul-sc.vercel.app` (domínio gratuito da Vercel). Migrar é o momento de já usar um domínio próprio definitivo. Confirmar se já existe um registrado ou se precisa comprar.
- [ ] Ter acesso ao painel de DNS do domínio (para apontar registros depois).

### Análise: PostgreSQL → MySQL (se decidir migrar o engine)

Achados reais no código (não é só configuração):

| Item | Onde | O que precisa mudar |
|---|---|---|
| Tipo nativo `@db.Uuid` | 41 ocorrências em `prisma/schema.prisma` | Remover a anotação ou trocar por `@db.Char(36)` — MySQL não tem tipo UUID nativo |
| Geração de UUID no banco | 16 modelos com `@default(dbgenerated("gen_random_uuid()"))` | Trocar por `@default(uuid())` (gerado pelo Prisma na aplicação — já é assim em 6 modelos, portável) |
| Lock de concorrência | `src/lib/auth/rate-limit.ts:56` — `pg_advisory_xact_lock(hashtext(...))` | Reescrever com `GET_LOCK()`/`RELEASE_LOCK()` do MySQL, ou redesenhar a lógica para não depender de lock explícito |
| Upsert atômico | `src/lib/auth/rate-limit.ts:104-112` — `ON CONFLICT ... DO UPDATE ... RETURNING` | Reescrever com `INSERT ... ON DUPLICATE KEY UPDATE` (sintaxe totalmente diferente, sem `RETURNING`) |
| Cast de tipo | mesmo arquivo — `${dimension}::"RateLimitDimension"` | Sintaxe `::tipo` é exclusiva do Postgres |
| Case-sensitivity | campos `@unique` como `email`, `slug` | Postgres diferencia maiúsculas/minúsculas por padrão, MySQL não — decidir se precisa de collation `_bin`/`_cs` |
| Migração de dados | banco de produção inteiro | Dump/restore direto não funciona entre os dois; usar `pgloader` ou ETL manual |

**Recomendação**: manter PostgreSQL na VPS, a menos que haja um motivo de negócio concreto para MySQL (ex.: ecossistema de revenda já centrado em MySQL/cPanel).

## 1. Preparar a VPS

- [ ] Provisionar a VPS (Ubuntu 22.04/24.04 LTS)
- [ ] Configurar firewall básico (`ufw`), acesso SSH só por chave (desativar login por senha)
- [ ] Instalar Docker + Docker Compose
- [ ] Instalar Coolify (ou a alternativa escolhida)
- [ ] Apontar um subdomínio de teste (ex. `painel.seudominio.com.br`) para o painel de administração da VPS

## 2. Banco de dados

- [ ] Subir o container do banco escolhido (Postgres recomendado) via Coolify
- [ ] Exportar os dados atuais do Supabase (`pg_dump`) — **nunca colar a `DATABASE_URL` ou senha em chat/print**, usar variável de ambiente no terminal
- [ ] Restaurar os dados no banco novo
- [ ] Rodar `npx prisma migrate deploy` apontando para o banco novo (aplica o histórico de migrations já existente, sem tocar em dado nenhum se for Postgres)
- [ ] Validar integridade: comparar contagem de linhas tabela a tabela entre o banco antigo e o novo

## 3. Variáveis de ambiente

- [ ] Levantar a lista de todas as env vars configuradas hoje na Vercel (nomes, não os valores, para conferência)
- [ ] Cadastrar as mesmas variáveis no Coolify, com os valores reais direto lá (nunca por chat)
- [ ] Ajustar `DATABASE_URL` para apontar para o banco novo
- [ ] Confirmar `SECURITY_HEADERS_HSTS` e as variáveis de storage (Supabase Storage/R2) — continuam as mesmas se o storage de imagens não for migrado junto (pode ficar no Supabase mesmo hospedando o app em outro lugar)

## 4. Deploy de teste (staging)

- [ ] Conectar o repositório Git ao Coolify
- [ ] Confirmar o comando de build (`prisma generate && next build --webpack`, já é o script `build` existente em `package.json` — nenhuma mudança necessária)
- [ ] Fazer o primeiro deploy num subdomínio de teste (ex. `staging.seudominio.com.br`)
- [ ] Rodar o checklist funcional completo do site (login admin, CRUD de produtos/artigos/banners, mapa de representantes, WhatsApp, formulários) — usar `docs/CHECKLIST.md` como referência
- [ ] Testar especificamente os pontos sensíveis a cache/CDN que já causaram incidente antes (cabeçalhos de segurança, CSP) — ver entrada de 12-13/09/2026 no `PLANO_MESTRE_FORTSULSC.md`

## 5. Corte para produção (cutover)

- [ ] Reduzir o TTL do DNS do domínio principal 24-48h antes (facilita reverter rápido se algo der errado)
- [ ] Apontar o domínio principal para o novo servidor
- [ ] Confirmar que o certificado TLS foi emitido automaticamente
- [ ] Testar o site em produção no domínio real
- [ ] **Manter o deploy da Vercel ativo por alguns dias como plano B** — não excluir o projeto lá ainda

## 6. Pós-migração

- [ ] Configurar backup automático do banco novo (diário, com retenção definida)
- [ ] Configurar monitoramento básico (uptime, uso de CPU/RAM/disco da VPS)
- [ ] Só desligar o projeto na Vercel depois de alguns dias estáveis em produção
- [ ] Atualizar `docs/ARCHITECTURE.md` e registrar a conclusão no `PLANO_MESTRE_FORTSULSC.md`
