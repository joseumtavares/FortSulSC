import { randomUUID } from 'node:crypto'
import { getImageStorage } from '@/lib/storage/image-storage'
import { matchesDeclaredImageType } from '@/lib/storage/image-signature'
import { logger } from '@/lib/logger'

const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export type ParsedBannerFile = { file: File; buffer: Buffer }

export async function parseBannerFile(form: FormData): Promise<ParsedBannerFile> {
  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('Arquivo obrigatório.')
  if (!extensions[file.type]) throw new Error('Use JPEG, PNG ou WEBP.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Arquivo maior que 5 MB.')

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!matchesDeclaredImageType(buffer, file.type)) throw new Error('Arquivo não corresponde ao tipo declarado.')

  return { file, buffer }
}

export async function deleteBannerImage(key: string) {
  try { await getImageStorage().delete(key) } catch { logger.error('storage.banner_delete_failed') }
}

export async function uploadBannerImage({ file, buffer }: ParsedBannerFile) {
  const imageKey = `banners/${randomUUID()}.${extensions[file.type]}`
  const uploaded = await getImageStorage().upload({ key: imageKey, body: buffer, contentType: file.type })
  return { imageKey, imageUrl: uploaded.url, mimeType: file.type, size: file.size }
}
