import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { deleteCommercialArea, findCommercialAreaForAdmin, updateCommercialArea } from '@/lib/content/commercial-area-repository'
import { parseCommercialAreaInput } from '@/lib/content/commercial-area-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const area = await findCommercialAreaForAdmin(id)
    if (!area) return NextResponse.json({ error: 'Área comercial não encontrada.' }, { status: 404 })
    let parsed
    try {
      parsed = parseCommercialAreaInput(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await updateCommercialArea(id, parsed)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'COMMERCIAL_AREA', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.commercial_area_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar a área comercial.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const area = await findCommercialAreaForAdmin(id)
    if (!area) return NextResponse.json({ error: 'Área comercial não encontrada.' }, { status: 404 })
    await deleteCommercialArea(id)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'DELETE', entityType: 'COMMERCIAL_AREA', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch (error) {
    const code = (error as { code?: string } | null)?.code
    if (code === 'P2003') {
      return NextResponse.json({ error: 'Área comercial tem parceiros vinculados. Remova o vínculo antes de excluir.' }, { status: 409 })
    }
    logger.error('content.commercial_area_delete_failed')
    return NextResponse.json({ error: 'Não foi possível excluir a área comercial.' }, { status: 500 })
  }
}
