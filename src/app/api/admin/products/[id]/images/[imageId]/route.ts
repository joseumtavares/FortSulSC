import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { deleteProductImage, findProductImage } from '@/lib/content/product-image-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { getImageStorage } from '@/lib/storage/image-storage'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; imageId: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id, imageId } = await context.params
    const image = await findProductImage(imageId)
    if (!image || image.productId !== id) return errorResponse('Imagem não encontrada.', 404)

    await deleteProductImage(imageId)

    try {
      await getImageStorage().delete(image.imageKey)
    } catch {
      logger.error('storage.product_image_delete_failed')
    }

    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')

    return NextResponse.json({ id: imageId }, { status: 200 })
  } catch {
    logger.error('content.product_image_delete_failed')
    return errorResponse('Não foi possível remover a imagem. Tente novamente em instantes.', 500)
  }
}
