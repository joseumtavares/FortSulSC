import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import type { AdminRole } from '@prisma/client'
import { auth } from '@/lib/auth/config'
import { isSameOriginRequest } from '@/lib/auth/origin-check'
import { ForbiddenRoleError, requireRole } from '@/lib/rbac/require-role'
import { findArticleForAdmin, updateArticleCoverImage } from '@/lib/content/article-repository'
import { getImageStorage } from '@/lib/storage/image-storage'
import { matchesDeclaredImageType } from '@/lib/storage/image-signature'
import { logger } from '@/lib/logger'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

async function replaceOldCoverImage(storage: ReturnType<typeof getImageStorage>, oldKey: string | null, newKey: string) {
  if (!oldKey || oldKey === newKey) return
  try {
    await storage.delete(oldKey)
  } catch {
    logger.error('storage.cover_delete_failed')
  }
}

async function applyCoverImageUpload(articleId: string, previousCoverImageKey: string | null, parsed: ParsedUpload) {
  const extension = ALLOWED_MIME_EXTENSIONS[parsed.file.type]
  const key = `articles/${articleId}/${randomUUID()}.${extension}`

  const storage = getImageStorage()
  const uploaded = await storage.upload({ key, body: parsed.buffer, contentType: parsed.file.type })

  await updateArticleCoverImage(articleId, {
    coverImageUrl: uploaded.url,
    coverImageKey: key,
    coverImageMime: parsed.file.type,
    coverImageSize: parsed.file.size,
    coverImageAlt: parsed.alt,
  })

  await replaceOldCoverImage(storage, previousCoverImageKey, key)

  return { coverImageUrl: uploaded.url, coverImageAlt: parsed.alt }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isSameOriginRequest(request)) return errorResponse('Origem inválida.', 403)

    const session = await auth()
    if (!session?.user) return errorResponse('Não autenticado.', 401)

    try {
      requireRole(session.user.role as AdminRole, ['ADMIN', 'EDITOR'])
    } catch (error) {
      if (error instanceof ForbiddenRoleError) return errorResponse('Sem permissão.', 403)
      throw error
    }

    const { id } = await context.params
    if (!UUID_PATTERN.test(id)) return errorResponse('Artigo não encontrado.', 404)

    const article = await findArticleForAdmin(id)
    if (!article) return errorResponse('Artigo não encontrado.', 404)

    const parsed = await parseUploadForm(await request.formData())
    if (typeof parsed === 'string') return errorResponse(parsed, 400)

    const result = await applyCoverImageUpload(id, article.coverImageKey, parsed)
    return NextResponse.json(result, { status: 200 })
  } catch {
    logger.error('storage.cover_upload_failed')
    return errorResponse('Não foi possível processar a imagem. Tente novamente em instantes.', 500)
  }
}
