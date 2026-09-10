import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findBannerForAdmin, updateBanner } from '@/lib/content/banner-repository'
import { parseBannerInput } from '@/lib/content/banner-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const banner = await findBannerForAdmin(id)
    if (!banner) return NextResponse.json({ error: 'Banner não encontrado.' }, { status: 404 })
    let parsed
    try { parsed = parseBannerInput(await readJsonObject(request)) } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await updateBanner(id, parsed)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'BANNER', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.banner_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar o banner.' }, { status: 500 })
  }
}
