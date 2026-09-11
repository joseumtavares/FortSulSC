import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findProductForAdmin, setProductSpecifications } from '@/lib/content/product-repository'
import { MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH, MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH } from '@/lib/content/text-limits'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

type Specification = { label: string; value: string; order: number }

function parseSpecifications(body: Record<string, unknown> | null): Specification[] {
  const specifications = body?.specifications
  if (!Array.isArray(specifications)) throw new Error('Lista de especificações inválida.')
  return specifications.map((item, index) => {
    const record = item as Record<string, unknown>
    const label = typeof record?.label === 'string' ? record.label.trim() : ''
    const value = typeof record?.value === 'string' ? record.value.trim() : ''
    if (!label || !value) throw new Error('Cada especificação precisa de rótulo e valor.')
    if (label.length > MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH) {
      throw new Error(`Rótulo da especificação deve ter no máximo ${MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH} caracteres.`)
    }
    if (value.length > MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH) {
      throw new Error(`Valor da especificação deve ter no máximo ${MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH} caracteres.`)
    }
    return { label, value, order: index }
  })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    let specifications: Specification[]
    try {
      specifications = parseSpecifications(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await setProductSpecifications(id, specifications)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch {
    logger.error('content.product_specifications_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar as especificações do produto.' }, { status: 500 })
  }
}
