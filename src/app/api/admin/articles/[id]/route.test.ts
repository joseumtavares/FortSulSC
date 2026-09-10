import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { requireAdminRequest, findArticleForAdmin, updateArticle, recordAuditEvent, logger } = vi.hoisted(() => ({
  requireAdminRequest: vi.fn(),
  findArticleForAdmin: vi.fn(),
  updateArticle: vi.fn(),
  recordAuditEvent: vi.fn(),
  logger: { info: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest }))
vi.mock('@/lib/content/article-repository', () => ({ findArticleForAdmin, updateArticle }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent }))
vi.mock('@/lib/logger', () => ({ logger }))

import { PATCH } from './route'

const ARTICLE_ID = 'article-1'

function buildRequest(body: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/articles/${ARTICLE_ID}`, {
    method: 'PATCH',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function callRoute(body: unknown) {
  return PATCH(buildRequest(body), { params: Promise.resolve({ id: ARTICLE_ID }) })
}

describe('PATCH /api/admin/articles/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminRequest.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1', role: 'ADMIN' } } })
    findArticleForAdmin.mockResolvedValue({ id: ARTICLE_ID })
    updateArticle.mockResolvedValue({ id: ARTICLE_ID })
  })

  it('propaga a resposta do guard quando não autorizado', async () => {
    const denied = new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401 })
    requireAdminRequest.mockResolvedValueOnce({ ok: false, response: denied })

    const response = await callRoute({ title: 'x', body: 'y' })

    expect(response.status).toBe(401)
    expect(updateArticle).not.toHaveBeenCalled()
  })

  it('retorna 404 quando o artigo não existe', async () => {
    findArticleForAdmin.mockResolvedValueOnce(null)
    const response = await callRoute({ title: 'x', body: 'y' })
    expect(response.status).toBe(404)
  })

  it('rejeita sem título', async () => {
    const response = await callRoute({ title: '', body: 'corpo' })
    expect(response.status).toBe(400)
  })

  it('atualiza o artigo e registra auditoria', async () => {
    const response = await callRoute({ title: 'Título editado', excerpt: 'Resumo', body: 'Corpo editado' })
    const json = (await response.json()) as { id: string }

    expect(response.status).toBe(200)
    expect(json).toEqual({ id: ARTICLE_ID })
    expect(updateArticle).toHaveBeenCalledWith(ARTICLE_ID, {
      title: 'Título editado',
      excerpt: 'Resumo',
      body: 'Corpo editado',
    })
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'UPDATE',
      entityType: 'ARTICLE',
      entityId: ARTICLE_ID,
      result: 'SUCCESS',
    })
  })

  it('retorna 500 sem vazar detalhes quando a atualização falha', async () => {
    updateArticle.mockRejectedValueOnce(new Error('falha interna'))
    const response = await callRoute({ title: 'Título', body: 'Corpo' })
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json.error).not.toContain('falha interna')
    expect(logger.error).toHaveBeenCalledWith('content.article_update_failed')
  })
})
