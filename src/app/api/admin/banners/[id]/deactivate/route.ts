import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findBannerForAdmin, updateBanner } from '@/lib/content/banner-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const banner = await findBannerForAdmin(id)
    if (!banner) return NextResponse.json({ error: 'Banner não encontrado.' }, { status: 404 })
    await updateBanner(id, { active: false })
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'DEACTIVATE', entityType: 'BANNER', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id, active: false })
  } catch {
    logger.error('content.banner_deactivate_failed')
    return NextResponse.json({ error: 'Não foi possível alterar a ativação do banner.' }, { status: 500 })
  }
}
