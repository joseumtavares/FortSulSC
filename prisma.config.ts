import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * Prisma CLI usa a URL direta e privilegiada para migrations.
 *
 * Em produção, DATABASE_URL deve apontar para a conexão agrupada do Supabase
 * e DATABASE_URL_MIGRATE para a conexão direta. No ambiente local, o fallback
 * mantém os comandos existentes funcionando com DATABASE_URL.
 */
const migrationUrl = process.env.DATABASE_URL_MIGRATE ?? process.env.DATABASE_URL

if (!migrationUrl) {
  throw new Error('Defina DATABASE_URL_MIGRATE (ou DATABASE_URL local) antes de usar o Prisma CLI.')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: migrationUrl,
  },
})
