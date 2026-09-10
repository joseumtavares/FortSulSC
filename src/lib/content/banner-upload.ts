import { randomUUID } from 'node:crypto'
import { getImageStorage } from '@/lib/storage/image-storage'
import { logger } from '@/lib/logger'

const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export function parseBannerFile(form: FormData): File {
  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('Arquivo obrigatório.')
  if (!extensions[file.type]) throw new Error('Use JPEG, PNG ou WEBP.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Arquivo maior que 5 MB.')
  return file
}

export async function deleteBannerImage(key: string) {
  try { await getImageStorage().delete(key) } catch { logger.error('storage.banner_delete_failed') }
}

export async function uploadBannerImage(file: File) {
  const imageKey = `banners/${randomUUID()}.${extensions[file.type]}`
  const uploaded = await getImageStorage().upload({ key: imageKey, body: Buffer.from(await file.arrayBuffer()), contentType: file.type })
  return { imageKey, imageUrl: uploaded.url, mimeType: file.type, size: file.size }
}
