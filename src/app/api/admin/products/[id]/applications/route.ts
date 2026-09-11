import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findProductForAdmin, setProductApplications } from '@/lib/content/product-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

type Application = { label: string; order: number }

function parseApplications(body: Record<string, unknown> | null): Application[] {
  const applications = body?.applications
  if (!Array.isArray(applications)) throw new Error('Lista de aplicações inválida.')
  return applications.map((item, index) => {
    if (!item || typeof item !== 'object' || typeof (item as Record<string, unknown>).label !== 'string') {
      throw new Error('Cada aplicação precisa de um rótulo de texto.')
    }
    const label = (item as Record<string, unknown>).label as string
    if (!label.trim()) throw new Error('Cada aplicação precisa de um rótulo de texto.')
    return { label: label.trim(), order: index }
  })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    let applications: Application[]
    try {
      applications = parseApplications(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await setProductApplications(id, applications)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch {
    logger.error('content.product_applications_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar as aplicações do produto.' }, { status: 500 })
  }
}
