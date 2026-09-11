import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { createProduct, listProductsForAdmin } from '@/lib/content/product-repository'
import { parseProductInput } from '@/lib/content/product-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    return NextResponse.json(await listProductsForAdmin())
  } catch {
    logger.error('content.product_list_failed')
    return NextResponse.json({ error: 'Não foi possível listar os produtos.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  let input
  try {
    input = parseProductInput(await readJsonObject(request))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
  }
  try {
    const product = await createProduct(input)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'CREATE', entityType: 'PRODUCT', entityId: product.id, result: 'SUCCESS' })
    return NextResponse.json({ id: product.id }, { status: 201 })
  } catch {
    logger.error('content.product_create_failed')
    return NextResponse.json({ error: 'Não foi possível criar o produto. Verifique se o código já está em uso.' }, { status: 500 })
  }
}
