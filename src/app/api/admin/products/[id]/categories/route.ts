import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findProductForAdmin, setProductCategories } from '@/lib/content/product-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function parseCategoryIds(body: Record<string, unknown> | null): string[] {
  const categoryIds = body?.categoryIds
  if (!Array.isArray(categoryIds) || categoryIds.some((value) => typeof value !== 'string' || value.trim() === '')) {
    throw new Error('Selecione ao menos uma categoria válida.')
  }
  return categoryIds
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    let categoryIds: string[]
    try {
      categoryIds = parseCategoryIds(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await setProductCategories(id, categoryIds)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch {
    logger.error('content.product_categories_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar as categorias do produto.' }, { status: 500 })
  }
}
