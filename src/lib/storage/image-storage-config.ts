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

type Environment = Record<string, string | undefined>

type RequiredR2Var = 'R2_ACCOUNT_ID' | 'R2_ACCESS_KEY_ID' | 'R2_SECRET_ACCESS_KEY' | 'R2_BUCKET' | 'R2_PUBLIC_BASE_URL'

function required(environment: Environment, name: RequiredR2Var): string {
  const value = environment[name]
  if (!value) throw new Error(`${name} ausente — obrigatório para storage de imagens em produção.`)
  return value
}

/**
 * Ponto único de composição do storage de imagens. Em desenvolvimento não
 * existe chamada externa; produção usa somente o provedor aprovado (Parte II
 * do Plano Mestre: Cloudflare R2 via Route Handler do próprio Next.js).
 */
export function getImageStorageConfig(environment: Environment = process.env): ImageStorageConfig {
  const provider = environment.STORAGE_PROVIDER ?? 'local'
  if (provider === 'local') return { provider: 'local' }

  if (provider !== 'r2') {
    throw new Error('STORAGE_PROVIDER deve ser "local" ou "r2".')
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
