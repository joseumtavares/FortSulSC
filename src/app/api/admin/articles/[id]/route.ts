import { NextResponse, type NextRequest } from 'next/server'
import { readJsonObject } from '@/lib/auth/request-body'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findArticleForAdmin, updateArticle } from '@/lib/content/article-repository'
import { parseArticleInput } from '@/lib/content/article-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const article = await findArticleForAdmin(id)
    if (!article) return errorResponse('Artigo não encontrado.', 404)

    let parsed
    try {
      parsed = parseArticleInput(await readJsonObject(request))
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Dados inválidos.', 400)
    }

    await updateArticle(id, { title: parsed.title, excerpt: parsed.excerpt, body: parsed.body })

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
