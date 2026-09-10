import { AwsClient } from 'aws4fetch'
import { logger } from '@/lib/logger'
import { getImageStorageConfig } from './image-storage-config'

export type UploadImageInput = {
  key: string
  body: Buffer
  contentType: string
}

export type UploadedImage = {
  url: string
}

export interface ImageStorage {
  upload(input: UploadImageInput): Promise<UploadedImage>
  delete(key: string): Promise<void>
}

/**
 * Storage de desenvolvimento — nunca envia bytes para fora do processo, só
 * registra que o upload/exclusão seriam simulados. A escolha do provedor
 * real fica concentrada na configuração, e nenhuma credencial é escrita nos
 * logs.
 */
class LocalImageStorage implements ImageStorage {
  upload({ key }: UploadImageInput): Promise<UploadedImage> {
    logger.info('storage.image_upload_simulated', { key })
    return Promise.resolve({ url: `local://${key}` })
  }

  delete(key: string): Promise<void> {
    logger.info('storage.image_delete_simulated', { key })
    return Promise.resolve()
  }
}

class R2ImageStorage implements ImageStorage {
  constructor(
    private readonly client: AwsClient,
    private readonly accountId: string,
    private readonly bucket: string,
    private readonly publicBaseUrl: string,
  ) {}

  private objectUrl(key: string): string {
    return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucket}/${key}`
  }

  async upload({ key, body, contentType }: UploadImageInput): Promise<UploadedImage> {
    const response = await this.client.fetch(this.objectUrl(key), {
      method: 'PUT',
      body: new Uint8Array(body),
      headers: { 'content-type': contentType },
    })
    if (!response.ok) throw new Error(`Falha ao enviar imagem ao R2 (status ${response.status}).`)

    return { url: `${this.publicBaseUrl}/${key}` }
  }

  async delete(key: string): Promise<void> {
    const response = await this.client.fetch(this.objectUrl(key), { method: 'DELETE' })
    if (!response.ok && response.status !== 404) {
      throw new Error(`Falha ao excluir imagem no R2 (status ${response.status}).`)
    }
  }
}

class SupabaseImageStorage implements ImageStorage {
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
    private readonly bucket: string,
  ) {}

  private objectUrl(key: string): string {
    return `${this.url}/storage/v1/object/${this.bucket}/${key}`
  }

  private authHeaders(): Record<string, string> {
    // O gateway do Supabase exige `apikey` além de `Authorization`, mesmo
    // em chamadas servidor-a-servidor com a service role key.
    return {
      authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
    }
  }

  async upload({ key, body, contentType }: UploadImageInput): Promise<UploadedImage> {
    const response = await fetch(this.objectUrl(key), {
      method: 'POST',
      body: new Uint8Array(body),
      headers: {
        ...this.authHeaders(),
        'content-type': contentType,
        'x-upsert': 'true',
      },
    })
    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Falha ao enviar imagem ao Supabase Storage (status ${response.status}): ${detail}`)
    }

    return { url: `${this.url}/storage/v1/object/public/${this.bucket}/${key}` }
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(this.objectUrl(key), {
      method: 'DELETE',
      headers: this.authHeaders(),
    })
    if (!response.ok && response.status !== 404) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Falha ao excluir imagem no Supabase Storage (status ${response.status}): ${detail}`)
    }
  }
}

export function getImageStorage(): ImageStorage {
  const config = getImageStorageConfig()
  if (config.provider === 'local') return new LocalImageStorage()

  if (config.provider === 'supabase') {
    return new SupabaseImageStorage(config.url, config.serviceRoleKey, config.bucket)
  }

  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: 's3',
    region: 'auto',
  })

  return new R2ImageStorage(client, config.accountId, config.bucket, config.publicBaseUrl)
}
