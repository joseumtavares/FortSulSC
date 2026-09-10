import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { requireAdminRequest, createArticle, generateUniqueArticleSlug, recordAuditEvent, logger } = vi.hoisted(
  () => ({
    requireAdminRequest: vi.fn(),
    createArticle: vi.fn(),
    generateUniqueArticleSlug: vi.fn(),
    recordAuditEvent: vi.fn(),
    logger: { info: vi.fn(), error: vi.fn() },
  }),
)

vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest }))
vi.mock('@/lib/content/article-repository', () => ({ createArticle, generateUniqueArticleSlug }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent }))
vi.mock('@/lib/logger', () => ({ logger }))

import { POST } from './route'

function buildRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/articles', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/articles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminRequest.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1', role: 'ADMIN' } } })
    generateUniqueArticleSlug.mockResolvedValue('novo-artigo')
    createArticle.mockResolvedValue({ id: 'article-1', slug: 'novo-artigo' })
  })

  it('propaga a resposta do guard quando não autorizado', async () => {
    const denied = new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401 })
    requireAdminRequest.mockResolvedValueOnce({ ok: false, response: denied })

    const response = await POST(buildRequest({ title: 'x', body: 'y' }))

    expect(response.status).toBe(401)
    expect(createArticle).not.toHaveBeenCalled()
  })

  it('rejeita sem título', async () => {
    const response = await POST(buildRequest({ title: '', body: 'corpo' }))
    expect(response.status).toBe(400)
  })

  it('rejeita sem corpo', async () => {
    const response = await POST(buildRequest({ title: 'Título', body: '   ' }))
    expect(response.status).toBe(400)
  })

  it('cria o artigo com slug gerado a partir do título e registra auditoria', async () => {
    const response = await POST(buildRequest({ title: 'Novo Artigo', excerpt: 'Resumo', body: 'Corpo completo' }))
    const json = (await response.json()) as { id: string; slug: string }

    expect(response.status).toBe(201)
    expect(json).toEqual({ id: 'article-1', slug: 'novo-artigo' })
    expect(generateUniqueArticleSlug).toHaveBeenCalledWith('Novo Artigo')
    expect(createArticle).toHaveBeenCalledWith({
      slug: 'novo-artigo',
      title: 'Novo Artigo',
      excerpt: 'Resumo',
      body: 'Corpo completo',
      authorId: 'admin-1',
    })
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'CREATE',
      entityType: 'ARTICLE',
      entityId: 'article-1',
      result: 'SUCCESS',
    })
  })

  it('retorna 500 sem vazar detalhes quando a criação falha', async () => {
    createArticle.mockRejectedValueOnce(new Error('erro interno de banco'))

    const response = await POST(buildRequest({ title: 'Título', body: 'Corpo' }))
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json.error).not.toContain('erro interno de banco')
    expect(logger.error).toHaveBeenCalledWith('content.article_create_failed')
  })
})
