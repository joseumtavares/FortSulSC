import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findPartnerForAdmin, setPartnerCommercialAreas } from '@/lib/content/partner-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function parseCommercialAreaIds(body: Record<string, unknown> | null): string[] {
  const commercialAreaIds = body?.commercialAreaIds
  if (!Array.isArray(commercialAreaIds) || commercialAreaIds.some((value) => typeof value !== 'string' || value.trim() === '')) {
    throw new Error('Selecione ao menos uma área comercial válida.')
  }
  return commercialAreaIds
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const partner = await findPartnerForAdmin(id)
    if (!partner) return NextResponse.json({ error: 'Parceiro não encontrado.' }, { status: 404 })
    let commercialAreaIds: string[]
    try {
      commercialAreaIds = parseCommercialAreaIds(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await setPartnerCommercialAreas(id, commercialAreaIds)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PARTNER', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.partner_commercial_areas_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar as áreas comerciais do parceiro.' }, { status: 500 })
  }
}
