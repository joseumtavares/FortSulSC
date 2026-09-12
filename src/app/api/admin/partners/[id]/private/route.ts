import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findPartnerForAdmin, upsertPartnerPrivate } from '@/lib/content/partner-repository'
import { parsePartnerPrivateInput } from '@/lib/content/partner-private-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const partner = await findPartnerForAdmin(id)
    if (!partner) return NextResponse.json({ error: 'Parceiro não encontrado.' }, { status: 404 })
    let input
    try {
      input = parsePartnerPrivateInput(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await upsertPartnerPrivate(id, input)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PARTNER', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.partner_private_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar os dados privados do parceiro.' }, { status: 500 })
  }
}
