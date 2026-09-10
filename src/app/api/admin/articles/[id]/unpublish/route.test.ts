import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { requireAdminRequest, findArticleForAdmin, unpublishArticle, recordAuditEvent, revalidatePath, logger } = vi.hoisted(() => ({
  requireAdminRequest: vi.fn(),
  findArticleForAdmin: vi.fn(),
  unpublishArticle: vi.fn(),
  recordAuditEvent: vi.fn(),
  revalidatePath: vi.fn(),
  logger: { info: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest }))
vi.mock('@/lib/content/article-repository', () => ({ findArticleForAdmin, unpublishArticle }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/lib/logger', () => ({ logger }))

import { POST } from './route'

const ARTICLE_ID = 'article-1'

function callRoute() {
  const request = new NextRequest(`http://localhost:3000/api/admin/articles/${ARTICLE_ID}/unpublish`, {
    method: 'POST',
    headers: { origin: 'http://localhost:3000' },
  })
  return POST(request, { params: Promise.resolve({ id: ARTICLE_ID }) })
}

describe('POST /api/admin/articles/[id]/unpublish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminRequest.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1', role: 'ADMIN' } } })
    findArticleForAdmin.mockResolvedValue({ id: ARTICLE_ID })
  })

  it('propaga a resposta do guard quando não autorizado', async () => {
    const denied = new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401 })
    requireAdminRequest.mockResolvedValueOnce({ ok: false, response: denied })

    const response = await callRoute()
    expect(response.status).toBe(401)
    expect(unpublishArticle).not.toHaveBeenCalled()
  })

  it('retorna 404 quando o artigo não existe', async () => {
    findArticleForAdmin.mockResolvedValueOnce(null)
    const response = await callRoute()
    expect(response.status).toBe(404)
  })

  it('despublica o artigo e registra auditoria', async () => {
    unpublishArticle.mockResolvedValueOnce({ id: ARTICLE_ID, status: 'DRAFT' })

    const response = await callRoute()
    const json = (await response.json()) as { status: string }

    expect(response.status).toBe(200)
    expect(json).toEqual({ status: 'DRAFT' })
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'UNPUBLISH',
      entityType: 'ARTICLE',
      entityId: ARTICLE_ID,
      result: 'SUCCESS',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('retorna 500 sem vazar detalhes em erro inesperado', async () => {
    unpublishArticle.mockRejectedValueOnce(new Error('falha de conexão'))

    const response = await callRoute()
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json.error).not.toContain('falha de conexão')
    expect(logger.error).toHaveBeenCalledWith('content.article_unpublish_failed')
  })
})
