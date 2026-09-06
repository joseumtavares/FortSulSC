/**
 * Contrato único de conexão usado pela aplicação e pelas ferramentas de banco.
 *
 * O produto usa recursos específicos de PostgreSQL. Por isso, esta abstração
 * troca o provedor de hospedagem (local, Supabase ou outro PostgreSQL), mas
 * não finge que o mesmo schema funciona em qualquer mecanismo SQL.
 */
export type DatabaseProvider = 'postgresql'
export type DatabasePlatform = 'local' | 'supabase' | 'postgres-compatible'

export type DatabaseConfig = {
  provider: DatabaseProvider
  platform: DatabasePlatform
  /** URL agrupada/adequada para consultas do runtime. Nunca exponha no cliente. */
  runtimeUrl: string
  /** URL direta, com permissão de owner, usada somente por Prisma CLI/migrations. */
  migrationUrl: string
}

type Environment = Record<string, string | undefined>

const isPlatform = (value: string): value is DatabasePlatform =>
  value === 'local' || value === 'supabase' || value === 'postgres-compatible'

const isPostgresUrl = (value: string) => value.startsWith('postgres://') || value.startsWith('postgresql://')

export function getDatabaseConfig(environment: Environment = process.env): DatabaseConfig {
  const provider = environment.DATABASE_PROVIDER ?? 'postgresql'
  if (provider !== 'postgresql') {
    throw new Error(`DATABASE_PROVIDER inválido: ${provider}. Este schema exige postgresql.`)
  }

  const platformValue = environment.DATABASE_PLATFORM ?? 'local'
  if (!isPlatform(platformValue)) {
    throw new Error(`DATABASE_PLATFORM inválido: ${platformValue}.`)
  }

  const runtimeUrl = environment.DATABASE_URL
  if (!runtimeUrl || !isPostgresUrl(runtimeUrl)) {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida.')
  }

  const migrationUrl = environment.DATABASE_URL_MIGRATE ?? (platformValue === 'local' ? runtimeUrl : undefined)
  if (!migrationUrl || !isPostgresUrl(migrationUrl)) {
    throw new Error('DATABASE_URL_MIGRATE deve ser uma URL PostgreSQL direta para migrations.')
  }

  return { provider, platform: platformValue, runtimeUrl, migrationUrl }
}
