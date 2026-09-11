import { NextResponse, type NextRequest } from 'next/server'
import { readJsonObject } from '@/lib/auth/request-body'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { createArticle, generateUniqueArticleSlug } from '@/lib/content/article-repository'
import { parseArticleInput } from '@/lib/content/article-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    let parsed
    try {
      parsed = parseArticleInput(await readJsonObject(request))
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Dados inválidos.', 400)
    }

    const slug = await generateUniqueArticleSlug(parsed.title)
    const article = await createArticle({
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      body: parsed.body,
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
