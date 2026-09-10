import { NextResponse, type NextRequest } from 'next/server'
import { readJsonObject } from '@/lib/auth/request-body'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { createArticle, generateUniqueArticleSlug } from '@/lib/content/article-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const body = await readJsonObject(request)
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const excerpt = typeof body?.excerpt === 'string' ? body.excerpt.trim() : ''
    const articleBody = typeof body?.body === 'string' ? body.body.trim() : ''

    if (!title) return errorResponse('Título obrigatório.', 400)
    if (!articleBody) return errorResponse('Corpo do artigo obrigatório.', 400)

    const slug = await generateUniqueArticleSlug(title)
    const article = await createArticle({
      slug,
      title,
      excerpt: excerpt || null,
      body: articleBody,
      authorId: guard.session.user.id,
    })

    await recordAuditEvent({
      adminUserId: guard.session.user.id,
      action: 'CREATE',
      entityType: 'ARTICLE',
      entityId: article.id,
      result: 'SUCCESS',
    })

    return NextResponse.json({ id: article.id, slug: article.slug }, { status: 201 })
  } catch {
    logger.error('content.article_create_failed')
    return errorResponse('Não foi possível criar o artigo. Tente novamente em instantes.', 500)
  }
}
