import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { createCommercialArea, listCommercialAreasForAdmin } from '@/lib/content/commercial-area-repository'
import { parseCommercialAreaInput } from '@/lib/content/commercial-area-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    return NextResponse.json(await listCommercialAreasForAdmin())
  } catch {
    logger.error('content.commercial_area_list_failed')
    return NextResponse.json({ error: 'Não foi possível listar as áreas comerciais.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  let input
  try {
    input = parseCommercialAreaInput(await readJsonObject(request))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
  }
  try {
    const area = await createCommercialArea(input)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'CREATE', entityType: 'COMMERCIAL_AREA', entityId: area.id, result: 'SUCCESS' })
    return NextResponse.json({ id: area.id }, { status: 201 })
  } catch {
    logger.error('content.commercial_area_create_failed')
    return NextResponse.json({ error: 'Não foi possível criar a área comercial.' }, { status: 500 })
  }
}
