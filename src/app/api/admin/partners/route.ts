import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { createPartner, listPartnersForAdmin } from '@/lib/content/partner-repository'
import { PARTNER_TYPES, parsePartnerInput, type PartnerType } from '@/lib/content/partner-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function parseTypeFilter(request: NextRequest): PartnerType | undefined {
  const type = request.nextUrl.searchParams.get('type')?.toUpperCase()
  return type && PARTNER_TYPES.includes(type as PartnerType) ? (type as PartnerType) : undefined
}

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    return NextResponse.json(await listPartnersForAdmin(parseTypeFilter(request)))
  } catch {
    logger.error('content.partner_list_failed')
    return NextResponse.json({ error: 'Não foi possível listar os parceiros.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  let input
  try {
    input = parsePartnerInput(await readJsonObject(request))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
  }
  try {
    const partner = await createPartner(input)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'CREATE', entityType: 'PARTNER', entityId: partner.id, result: 'SUCCESS' })
    return NextResponse.json({ id: partner.id }, { status: 201 })
  } catch {
    logger.error('content.partner_create_failed')
    return NextResponse.json({ error: 'Não foi possível criar o parceiro.' }, { status: 500 })
  }
}
