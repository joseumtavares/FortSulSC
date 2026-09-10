import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { ArticleMissingCoverImageError, findArticleForAdmin, publishArticle } from '@/lib/content/article-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  const { id } = await context.params

  try {
    const article = await findArticleForAdmin(id)
    if (!article) return errorResponse('Artigo não encontrado.', 404)

    await publishArticle(id)

    await recordAuditEvent({
      adminUserId: guard.session.user.id,
      action: 'PUBLISH',
      entityType: 'ARTICLE',
      entityId: id,
      result: 'SUCCESS',
    })

    revalidatePath('/')

    return NextResponse.json({ status: 'PUBLISHED' }, { status: 200 })
  } catch (error) {
    if (error instanceof ArticleMissingCoverImageError) {
      await recordAuditEvent({
        adminUserId: guard.session.user.id,
        action: 'PUBLISH',
        entityType: 'ARTICLE',
        entityId: id,
        result: 'FAILURE',
      })
      return errorResponse(error.message, 400)
    }

    logger.error('content.article_publish_failed')
    return errorResponse('Não foi possível publicar o artigo. Tente novamente em instantes.', 500)
  }
}
