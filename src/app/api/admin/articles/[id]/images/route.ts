import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findArticleForAdmin } from '@/lib/content/article-repository'
import {
  MAX_ARTICLE_IMAGES,
  countArticleImages,
  createArticleImage,
} from '@/lib/content/article-image-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { getImageStorage } from '@/lib/storage/image-storage'
import { matchesDeclaredImageType } from '@/lib/storage/image-signature'
import { logger } from '@/lib/logger'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

type ParsedUpload = { file: File; buffer: Buffer; alt: string }

async function parseUploadForm(formData: FormData): Promise<ParsedUpload | string> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return 'Arquivo obrigatório.'

  const alt = formData.get('alt')
  if (typeof alt !== 'string' || alt.trim() === '') return 'Texto alternativo obrigatório.'

  if (!ALLOWED_MIME_EXTENSIONS[file.type]) return 'Tipo de arquivo não suportado. Use JPEG, PNG ou WEBP.'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'Arquivo maior que 5 MB.'

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!matchesDeclaredImageType(buffer, file.type)) return 'Arquivo não corresponde ao tipo declarado.'

  return { file, buffer, alt: alt.trim() }
}

async function uploadArticleImage(articleId: string, parsed: ParsedUpload) {
  const extension = ALLOWED_MIME_EXTENSIONS[parsed.file.type]
  const key = `articles/${articleId}/gallery/${randomUUID()}.${extension}`

  const uploaded = await getImageStorage().upload({ key, body: parsed.buffer, contentType: parsed.file.type })

  return createArticleImage({
    articleId,
    imageUrl: uploaded.url,
    imageKey: key,
    mimeType: parsed.file.type,
    size: parsed.file.size,
    altText: parsed.alt,
  })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const article = await findArticleForAdmin(id)
    if (!article) return errorResponse('Artigo não encontrado.', 404)

    const existingCount = await countArticleImages(id)
    if (existingCount >= MAX_ARTICLE_IMAGES) {
      return errorResponse(`Limite de ${MAX_ARTICLE_IMAGES} imagens por artigo atingido.`, 400)
    }

    const parsed = await parseUploadForm(await request.formData())
    if (typeof parsed === 'string') return errorResponse(parsed, 400)

    const image = await uploadArticleImage(id, parsed)

    await recordAuditEvent({
      adminUserId: guard.session.user.id,
      action: 'UPDATE',
      entityType: 'ARTICLE',
      entityId: id,
      result: 'SUCCESS',
    })

    return NextResponse.json({ id: image.id, imageUrl: image.imageUrl, altText: image.altText }, { status: 201 })
  } catch {
    logger.error('content.article_image_create_failed')
    return errorResponse('Não foi possível enviar a imagem. Tente novamente em instantes.', 500)
  }
}
