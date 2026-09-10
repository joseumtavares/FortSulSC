import { NextResponse, type NextRequest } from 'next/server'
import { readJsonObject } from '@/lib/auth/request-body'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findArticleForAdmin, updateArticle } from '@/lib/content/article-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

type ParsedArticleInput = { title: string; excerpt: string; body: string }

async function parseArticleBody(request: NextRequest): Promise<ParsedArticleInput | string> {
  const body = await readJsonObject(request)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const excerpt = typeof body?.excerpt === 'string' ? body.excerpt.trim() : ''
  const articleBody = typeof body?.body === 'string' ? body.body.trim() : ''

  if (!title) return 'Título obrigatório.'
  if (!articleBody) return 'Corpo do artigo obrigatório.'

  return { title, excerpt, body: articleBody }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const article = await findArticleForAdmin(id)
    if (!article) return errorResponse('Artigo não encontrado.', 404)

    const parsed = await parseArticleBody(request)
    if (typeof parsed === 'string') return errorResponse(parsed, 400)

    await updateArticle(id, { title: parsed.title, excerpt: parsed.excerpt || null, body: parsed.body })

    await recordAuditEvent({
      adminUserId: guard.session.user.id,
      action: 'UPDATE',
      entityType: 'ARTICLE',
      entityId: id,
      result: 'SUCCESS',
    })

    return NextResponse.json({ id }, { status: 200 })
  } catch {
    logger.error('content.article_update_failed')
    return errorResponse('Não foi possível salvar o artigo. Tente novamente em instantes.', 500)
  }
}
