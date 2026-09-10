import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { deleteArticleImage, findArticleImage } from '@/lib/content/article-image-repository'
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
    const image = await findArticleImage(imageId)
    if (!image || image.articleId !== id) return errorResponse('Imagem não encontrada.', 404)

    await deleteArticleImage(imageId)

    try {
      await getImageStorage().delete(image.imageKey)
    } catch {
      logger.error('storage.article_image_delete_failed')
    }

    await recordAuditEvent({
      adminUserId: guard.session.user.id,
      action: 'UPDATE',
      entityType: 'ARTICLE',
      entityId: id,
      result: 'SUCCESS',
    })

    return NextResponse.json({ id: imageId }, { status: 200 })
  } catch {
    logger.error('content.article_image_delete_failed')
    return errorResponse('Não foi possível remover a imagem. Tente novamente em instantes.', 500)
  }
}
