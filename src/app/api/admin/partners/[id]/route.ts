import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { deletePartner, findPartnerForAdmin, updatePartner } from '@/lib/content/partner-repository'
import { applyLocationLink, parsePartnerInput } from '@/lib/content/partner-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const partner = await findPartnerForAdmin(id)
    if (!partner) return NextResponse.json({ error: 'Parceiro não encontrado.' }, { status: 404 })
    let parsed
    try {
      parsed = await applyLocationLink(parsePartnerInput(await readJsonObject(request)))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await updatePartner(id, parsed)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PARTNER', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.partner_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar o parceiro.' }, { status: 500 })
  }
}

/**
 * Exclusão física — mesmo padrão já aprovado para Product (achado de
 * segurança de hoje restringe a ADMIN, dado tratar-se de dado de
 * pessoa/empresa real).
 */
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request, ['ADMIN'])
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const partner = await findPartnerForAdmin(id)
    if (!partner) return NextResponse.json({ error: 'Parceiro não encontrado.' }, { status: 404 })
    await deletePartner(id)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'DELETE', entityType: 'PARTNER', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.partner_delete_failed')
    return NextResponse.json({ error: 'Não foi possível excluir o parceiro.' }, { status: 500 })
  }
}
