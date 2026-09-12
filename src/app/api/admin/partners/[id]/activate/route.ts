import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findPartnerForAdmin, updatePartnerActive } from '@/lib/content/partner-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const partner = await findPartnerForAdmin(id)
    if (!partner) return NextResponse.json({ error: 'Parceiro não encontrado.' }, { status: 404 })
    await updatePartnerActive(id, true)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'ACTIVATE', entityType: 'PARTNER', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id, active: true })
  } catch {
    logger.error('content.partner_activate_failed')
    return NextResponse.json({ error: 'Não foi possível alterar a ativação do parceiro.' }, { status: 500 })
  }
}
