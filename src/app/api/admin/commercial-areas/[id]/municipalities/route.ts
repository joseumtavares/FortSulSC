import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findCommercialAreaForAdmin, setCommercialAreaMunicipalities } from '@/lib/content/commercial-area-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function parseMunicipalityIds(body: Record<string, unknown> | null): string[] {
  const municipalityIds = body?.municipalityIds
  if (!Array.isArray(municipalityIds) || municipalityIds.some((value) => typeof value !== 'string' || value.trim() === '')) {
    throw new Error('Selecione ao menos um município válido.')
  }
  return municipalityIds
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const area = await findCommercialAreaForAdmin(id)
    if (!area) return NextResponse.json({ error: 'Área comercial não encontrada.' }, { status: 404 })
    let municipalityIds: string[]
    try {
      municipalityIds = parseMunicipalityIds(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await setCommercialAreaMunicipalities(id, municipalityIds)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'COMMERCIAL_AREA', entityId: id, result: 'SUCCESS' })
    return NextResponse.json({ id })
  } catch {
    logger.error('content.commercial_area_municipalities_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar os municípios da área comercial.' }, { status: 500 })
  }
}
