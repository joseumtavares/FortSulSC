import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findProductForAdmin } from '@/lib/content/product-repository'
import { countProductImages, createProductImage } from '@/lib/content/product-image-repository'
import { MAX_PRODUCT_IMAGES } from '@/lib/content/product-image-input'
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

type ParsedUpload = { file: File; buffer: Buffer; alt: string; role: 'HERO' | 'GALLERY' }

async function parseUploadForm(formData: FormData): Promise<ParsedUpload | string> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return 'Arquivo obrigatório.'

  const alt = formData.get('alt')
  if (typeof alt !== 'string' || alt.trim() === '') return 'Texto alternativo obrigatório.'

  const roleValue = formData.get('role')
  const role = roleValue === 'HERO' ? 'HERO' : 'GALLERY'

  if (!ALLOWED_MIME_EXTENSIONS[file.type]) return 'Tipo de arquivo não suportado. Use JPEG, PNG ou WEBP.'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'Arquivo maior que 5 MB.'

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!matchesDeclaredImageType(buffer, file.type)) return 'Arquivo não corresponde ao tipo declarado.'

  return { file, buffer, alt: alt.trim(), role }
}

async function uploadProductImage(productId: string, parsed: ParsedUpload) {
  const extension = ALLOWED_MIME_EXTENSIONS[parsed.file.type]
  const key = `products/${productId}/${randomUUID()}.${extension}`

  const uploaded = await getImageStorage().upload({ key, body: parsed.buffer, contentType: parsed.file.type })

  return createProductImage({
    productId,
    imageUrl: uploaded.url,
    imageKey: key,
    mimeType: parsed.file.type,
    size: parsed.file.size,
    altText: parsed.alt,
    role: parsed.role,
  })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return errorResponse('Produto não encontrado.', 404)

    const existingCount = await countProductImages(id)
    if (existingCount >= MAX_PRODUCT_IMAGES) {
      return errorResponse(`Limite de ${MAX_PRODUCT_IMAGES} imagens por produto atingido.`, 400)
    }

    const parsed = await parseUploadForm(await request.formData())
    if (typeof parsed === 'string') return errorResponse(parsed, 400)

    const image = await uploadProductImage(id, parsed)

    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')

    return NextResponse.json({ id: image.id, imageUrl: image.imageUrl, altText: image.altText, role: image.role }, { status: 201 })
  } catch {
    logger.error('content.product_image_create_failed')
    return errorResponse('Não foi possível enviar a imagem. Tente novamente em instantes.', 500)
  }
}
