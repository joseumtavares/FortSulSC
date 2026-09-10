import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findArticleForAdmin, unpublishArticle } from '@/lib/content/article-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const article = await findArticleForAdmin(id)
    if (!article) return errorResponse('Artigo não encontrado.', 404)

    await unpublishArticle(id)

    await recordAuditEvent({
      adminUserId: guard.session.user.id,
      action: 'UNPUBLISH',
      entityType: 'ARTICLE',
      entityId: id,
      result: 'SUCCESS',
    })

    revalidatePath('/')

    return NextResponse.json({ status: 'DRAFT' }, { status: 200 })
  } catch {
    logger.error('content.article_unpublish_failed')
    return errorResponse('Não foi possível despublicar o artigo. Tente novamente em instantes.', 500)
  }
}
