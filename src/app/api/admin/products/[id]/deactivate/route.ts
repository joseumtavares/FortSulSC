import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findProductForAdmin, updateProductActive } from '@/lib/content/product-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    await updateProductActive(id, false)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'DEACTIVATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id, active: false })
  } catch {
    logger.error('content.product_deactivate_failed')
    return NextResponse.json({ error: 'Não foi possível alterar a ativação do produto.' }, { status: 500 })
  }
}
