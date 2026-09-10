import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { requireAdminRequest, findArticleForAdmin, publishArticle, recordAuditEvent, revalidatePath, logger, ArticleMissingCoverImageError } =
  vi.hoisted(() => {
    class ArticleMissingCoverImageError extends Error {
      constructor() {
        super('Artigo precisa de imagem de capa e texto alternativo para ser publicado')
      }
    }

    return {
      requireAdminRequest: vi.fn(),
      findArticleForAdmin: vi.fn(),
      publishArticle: vi.fn(),
      recordAuditEvent: vi.fn(),
      revalidatePath: vi.fn(),
      logger: { info: vi.fn(), error: vi.fn() },
      ArticleMissingCoverImageError,
    }
  })

vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest }))
vi.mock('@/lib/content/article-repository', () => ({
  findArticleForAdmin,
  publishArticle,
  ArticleMissingCoverImageError,
}))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/lib/logger', () => ({ logger }))

import { POST } from './route'

const ARTICLE_ID = 'article-1'

function callRoute() {
  const request = new NextRequest(`http://localhost:3000/api/admin/articles/${ARTICLE_ID}/publish`, {
    method: 'POST',
    headers: { origin: 'http://localhost:3000' },
  })
  return POST(request, { params: Promise.resolve({ id: ARTICLE_ID }) })
}

describe('POST /api/admin/articles/[id]/publish', () => {
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
    expect(publishArticle).not.toHaveBeenCalled()
  })

  it('retorna 404 quando o artigo não existe', async () => {
    findArticleForAdmin.mockResolvedValueOnce(null)
    const response = await callRoute()
    expect(response.status).toBe(404)
  })

  it('publica o artigo e registra auditoria de sucesso', async () => {
    publishArticle.mockResolvedValueOnce({ id: ARTICLE_ID, status: 'PUBLISHED' })

    const response = await callRoute()
    const json = (await response.json()) as { status: string }

    expect(response.status).toBe(200)
    expect(json).toEqual({ status: 'PUBLISHED' })
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'PUBLISH',
      entityType: 'ARTICLE',
      entityId: ARTICLE_ID,
      result: 'SUCCESS',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('retorna 400 e registra auditoria de falha quando falta imagem de capa, sem revalidar a home', async () => {
    publishArticle.mockRejectedValueOnce(new ArticleMissingCoverImageError())

    const response = await callRoute()
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(400)
    expect(json.error).toContain('imagem de capa')
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'PUBLISH',
      entityType: 'ARTICLE',
      entityId: ARTICLE_ID,
      result: 'FAILURE',
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('retorna 500 sem vazar detalhes em erro inesperado', async () => {
    publishArticle.mockRejectedValueOnce(new Error('falha de conexão'))

    const response = await callRoute()
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json.error).not.toContain('falha de conexão')
    expect(logger.error).toHaveBeenCalledWith('content.article_publish_failed')
  })
})
