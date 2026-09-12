import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { deleteProduct, findProductForAdmin, updateProduct } from '@/lib/content/product-repository'
import { parseProductInput } from '@/lib/content/product-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { getImageStorage } from '@/lib/storage/image-storage'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })
    let parsed
    try {
      parsed = parseProductInput(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await updateProduct(id, parsed)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch {
    logger.error('content.product_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar o produto. Verifique se o código já está em uso.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request, ['ADMIN'])
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 })

    await deleteProduct(id)

    const storage = getImageStorage()
    await Promise.all(
      product.images.map((image) =>
        storage.delete(image.imageKey).catch(() => logger.error('storage.product_image_delete_failed')),
      ),
    )

    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'DELETE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch {
    logger.error('content.product_delete_failed')
    return NextResponse.json({ error: 'Não foi possível excluir o produto.' }, { status: 500 })
  }
}
