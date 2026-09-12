import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { getInstitutionalSettings, upsertInstitutionalSettings } from '@/lib/content/institutional-settings-repository'
import { parseInstitutionalSettings } from '@/lib/content/institutional-settings-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try { return NextResponse.json(await getInstitutionalSettings()) } catch {
    logger.error('content.settings_get_failed')
    return NextResponse.json({ error: 'Não foi possível carregar as configurações.' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdminRequest(request, ['ADMIN'])
  if (!guard.ok) return guard.response
  let input
  try { input = parseInstitutionalSettings(await readJsonObject(request)) } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
  }
  try {
    const settings = await upsertInstitutionalSettings(input)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'INSTITUTIONAL_SETTINGS', entityId: settings.id, result: 'SUCCESS' })
    return NextResponse.json({ id: settings.id })
  } catch {
    logger.error('content.settings_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar as configurações.' }, { status: 500 })
  }
}
