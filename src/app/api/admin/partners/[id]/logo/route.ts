import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findPartnerForAdmin, updatePartnerLogo } from '@/lib/content/partner-repository'
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

async function parseUploadForm(formData: FormData): Promise<{ file: File; buffer: Buffer } | string> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return 'Arquivo obrigatório.'
  if (!ALLOWED_MIME_EXTENSIONS[file.type]) return 'Tipo de arquivo não suportado. Use JPEG, PNG ou WEBP.'
  if (file.size > MAX_FILE_SIZE_BYTES) return 'Arquivo maior que 5 MB.'

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!matchesDeclaredImageType(buffer, file.type)) return 'Arquivo não corresponde ao tipo declarado.'

  return { file, buffer }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const partner = await findPartnerForAdmin(id)
    if (!partner) return errorResponse('Parceiro não encontrado.', 404)

    const parsed = await parseUploadForm(await request.formData())
    if (typeof parsed === 'string') return errorResponse(parsed, 400)

    const extension = ALLOWED_MIME_EXTENSIONS[parsed.file.type]
    const key = `partners/${id}/${randomUUID()}.${extension}`
    const storage = getImageStorage()
    const uploaded = await storage.upload({ key, body: parsed.buffer, contentType: parsed.file.type })

    await updatePartnerLogo(id, uploaded.url, key)

    if (partner.logoKey && partner.logoKey !== key) {
      await storage.delete(partner.logoKey).catch(() => logger.error('storage.partner_logo_delete_failed'))
    }

    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PARTNER', entityId: id, result: 'SUCCESS' })

    return NextResponse.json({ id, logoUrl: uploaded.url })
  } catch {
    logger.error('content.partner_logo_upload_failed')
    return errorResponse('Não foi possível enviar a logo. Tente novamente em instantes.', 500)
  }
}
