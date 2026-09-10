export type ImageStorageConfig =
  | { provider: 'local' }
  | {
      provider: 'r2'
      accountId: string
      accessKeyId: string
      secretAccessKey: string
      bucket: string
      publicBaseUrl: string
    }
  | {
      provider: 'supabase'
      url: string
      serviceRoleKey: string
      bucket: string
    }

type Environment = Record<string, string | undefined>

type RequiredVar =
  | 'R2_ACCOUNT_ID'
  | 'R2_ACCESS_KEY_ID'
  | 'R2_SECRET_ACCESS_KEY'
  | 'R2_BUCKET'
  | 'R2_PUBLIC_BASE_URL'
  | 'SUPABASE_STORAGE_URL'
  | 'SUPABASE_STORAGE_SERVICE_KEY'
  | 'SUPABASE_STORAGE_BUCKET'

function required(environment: Environment, name: RequiredVar): string {
  const value = environment[name]
  if (!value) throw new Error(`${name} ausente — obrigatório para storage de imagens em produção.`)
  return value
}

/**
 * Ponto único de composição do storage de imagens. Em desenvolvimento não
 * existe chamada externa; produção escolhe entre os provedores aprovados
 * (Parte II do Plano Mestre: nunca um serviço intermediário próprio, só
 * Route Handler do Next.js chamando o provedor de objetos diretamente) via
 * `STORAGE_PROVIDER`, para trocar de servidor (Cloudflare R2, Supabase
 * Storage) sem alterar código de rota.
 */
export function getImageStorageConfig(environment: Environment = process.env): ImageStorageConfig {
  const provider = environment.STORAGE_PROVIDER ?? 'local'
  if (provider === 'local') return { provider: 'local' }

  if (provider === 'supabase') {
    return {
      provider: 'supabase',
      url: required(environment, 'SUPABASE_STORAGE_URL'),
      serviceRoleKey: required(environment, 'SUPABASE_STORAGE_SERVICE_KEY'),
      bucket: required(environment, 'SUPABASE_STORAGE_BUCKET'),
    }
  }

  if (provider !== 'r2') {
    throw new Error('STORAGE_PROVIDER deve ser "local", "r2" ou "supabase".')
  }

  return {
    provider: 'r2',
    accountId: required(environment, 'R2_ACCOUNT_ID'),
    accessKeyId: required(environment, 'R2_ACCESS_KEY_ID'),
    secretAccessKey: required(environment, 'R2_SECRET_ACCESS_KEY'),
    bucket: required(environment, 'R2_BUCKET'),
    publicBaseUrl: required(environment, 'R2_PUBLIC_BASE_URL'),
  }
}
