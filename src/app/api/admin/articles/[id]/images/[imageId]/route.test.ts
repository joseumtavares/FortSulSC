import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { requireAdminRequest, findArticleImage, deleteArticleImage, recordAuditEvent, storageDelete, logger } =
  vi.hoisted(() => ({
    requireAdminRequest: vi.fn(),
    findArticleImage: vi.fn(),
    deleteArticleImage: vi.fn(),
    recordAuditEvent: vi.fn(),
    storageDelete: vi.fn(),
    logger: { info: vi.fn(), error: vi.fn() },
  }))

vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest }))
vi.mock('@/lib/content/article-image-repository', () => ({ findArticleImage, deleteArticleImage }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent }))
vi.mock('@/lib/storage/image-storage', () => ({
  getImageStorage: () => ({ upload: vi.fn(), delete: storageDelete }),
}))
vi.mock('@/lib/logger', () => ({ logger }))

import { DELETE } from './route'

const ARTICLE_ID = 'article-1'
const IMAGE_ID = 'image-1'

function buildRequest(): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/articles/${ARTICLE_ID}/images/${IMAGE_ID}`, {
    method: 'DELETE',
    headers: { origin: 'http://localhost:3000' },
  })
}

function callRoute() {
  return DELETE(buildRequest(), { params: Promise.resolve({ id: ARTICLE_ID, imageId: IMAGE_ID }) })
}

describe('DELETE /api/admin/articles/[id]/images/[imageId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminRequest.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1', role: 'ADMIN' } } })
    findArticleImage.mockResolvedValue({ id: IMAGE_ID, articleId: ARTICLE_ID, imageKey: 'articles/article-1/gallery/a.jpg' })
    deleteArticleImage.mockResolvedValue({ id: IMAGE_ID })
    storageDelete.mockResolvedValue(undefined)
  })

  it('propaga a resposta do guard quando não autorizado', async () => {
    const denied = new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401 })
    requireAdminRequest.mockResolvedValueOnce({ ok: false, response: denied })

    const response = await callRoute()

    expect(response.status).toBe(401)
    expect(deleteArticleImage).not.toHaveBeenCalled()
  })

  it('retorna 404 quando a imagem não existe', async () => {
    findArticleImage.mockResolvedValueOnce(null)
    const response = await callRoute()
    expect(response.status).toBe(404)
  })

  it('retorna 404 quando a imagem pertence a outro artigo', async () => {
    findArticleImage.mockResolvedValueOnce({ id: IMAGE_ID, articleId: 'outro-artigo', imageKey: 'x' })
    const response = await callRoute()
    expect(response.status).toBe(404)
  })

  it('remove a imagem do banco, do storage e audita como UPDATE', async () => {
    const response = await callRoute()
    const json = (await response.json()) as { id: string }

    expect(response.status).toBe(200)
    expect(json).toEqual({ id: IMAGE_ID })
    expect(deleteArticleImage).toHaveBeenCalledWith(IMAGE_ID)
    expect(storageDelete).toHaveBeenCalledWith('articles/article-1/gallery/a.jpg')
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'UPDATE',
      entityType: 'ARTICLE',
      entityId: ARTICLE_ID,
      result: 'SUCCESS',
    })
  })

  it('continua e audita mesmo se a exclusão no storage falhar', async () => {
    storageDelete.mockRejectedValueOnce(new Error('falha no r2'))
    const response = await callRoute()

    expect(response.status).toBe(200)
    expect(recordAuditEvent).toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith('storage.article_image_delete_failed')
  })

  it('retorna 500 sem vazar detalhes quando a remoção no banco falha', async () => {
    deleteArticleImage.mockRejectedValueOnce(new Error('falha interna'))
    const response = await callRoute()
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json.error).not.toContain('falha interna')
    expect(logger.error).toHaveBeenCalledWith('content.article_image_delete_failed')
  })
})
