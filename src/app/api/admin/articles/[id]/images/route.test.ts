// @vitest-environment node
//
// jsdom não implementa FormData/File de forma compatível com o parser de
// multipart do runtime fetch do Next.js (usado por `request.formData()`);
// ver src/app/api/admin/articles/[id]/cover/route.test.ts.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  requireAdminRequest,
  findArticleForAdmin,
  countArticleImages,
  createArticleImage,
  recordAuditEvent,
  storageUpload,
  logger,
} = vi.hoisted(() => ({
  requireAdminRequest: vi.fn(),
  findArticleForAdmin: vi.fn(),
  countArticleImages: vi.fn(),
  createArticleImage: vi.fn(),
  recordAuditEvent: vi.fn(),
  storageUpload: vi.fn(),
  logger: { info: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest }))
vi.mock('@/lib/content/article-repository', () => ({ findArticleForAdmin }))
vi.mock('@/lib/content/article-image-repository', () => ({
  MAX_ARTICLE_IMAGES: 4,
  countArticleImages,
  createArticleImage,
}))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent }))
vi.mock('@/lib/storage/image-storage', () => ({
  getImageStorage: () => ({ upload: storageUpload, delete: vi.fn() }),
}))
vi.mock('@/lib/logger', () => ({ logger }))

import { POST } from './route'

const ARTICLE_ID = 'article-1'

function buildRequest(formData: FormData): NextRequest {
  return new NextRequest(`http://localhost:3000/api/admin/articles/${ARTICLE_ID}/images`, {
    method: 'POST',
    headers: { origin: 'http://localhost:3000' },
    body: formData,
  })
}

function callRoute(formData: FormData) {
  return POST(buildRequest(formData), { params: Promise.resolve({ id: ARTICLE_ID }) })
}

function buildFormData(overrides: Partial<{ file: File; alt: string }> = {}): FormData {
  const formData = new FormData()
  const file = overrides.file ?? new File([new Uint8Array([0xff, 0xd8, 0xff])], 'foto.jpg', { type: 'image/jpeg' })
  formData.set('file', file)
  formData.set('alt', overrides.alt ?? 'Foto do artigo')
  return formData
}

describe('POST /api/admin/articles/[id]/images', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdminRequest.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1', role: 'ADMIN' } } })
    findArticleForAdmin.mockResolvedValue({ id: ARTICLE_ID })
    countArticleImages.mockResolvedValue(0)
    storageUpload.mockResolvedValue({ url: 'https://images.test/articles/article-1/gallery/a.jpg' })
    createArticleImage.mockResolvedValue({
      id: 'image-1',
      imageUrl: 'https://images.test/articles/article-1/gallery/a.jpg',
      altText: 'Foto do artigo',
    })
  })

  it('propaga a resposta do guard quando não autorizado', async () => {
    const denied = new Response(JSON.stringify({ error: 'Não autenticado.' }), { status: 401 })
    requireAdminRequest.mockResolvedValueOnce({ ok: false, response: denied })

    const response = await callRoute(buildFormData())

    expect(response.status).toBe(401)
    expect(createArticleImage).not.toHaveBeenCalled()
  })

  it('retorna 404 quando o artigo não existe', async () => {
    findArticleForAdmin.mockResolvedValueOnce(null)
    const response = await callRoute(buildFormData())
    expect(response.status).toBe(404)
  })

  it('rejeita quando o limite de imagens já foi atingido', async () => {
    countArticleImages.mockResolvedValueOnce(4)
    const response = await callRoute(buildFormData())
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(400)
    expect(json.error).toContain('4 imagens')
    expect(storageUpload).not.toHaveBeenCalled()
  })

  it('rejeita sem arquivo', async () => {
    const formData = new FormData()
    formData.set('alt', 'Foto')
    const response = await callRoute(formData)
    expect(response.status).toBe(400)
  })

  it('rejeita sem texto alternativo', async () => {
    const response = await callRoute(buildFormData({ alt: '' }))
    expect(response.status).toBe(400)
  })

  it('rejeita arquivo cujo conteúdo não corresponde ao tipo declarado', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'foto.jpg', { type: 'image/jpeg' })
    const response = await callRoute(buildFormData({ file }))
    expect(response.status).toBe(400)
    expect(storageUpload).not.toHaveBeenCalled()
  })

  it('envia a imagem, cria o registro e audita como UPDATE', async () => {
    const response = await callRoute(buildFormData())
    const json = (await response.json()) as { id: string; imageUrl: string }

    expect(response.status).toBe(201)
    expect(json.id).toBe('image-1')
    expect(createArticleImage).toHaveBeenCalledWith(
      expect.objectContaining({ articleId: ARTICLE_ID, altText: 'Foto do artigo' }),
    )
    expect(recordAuditEvent).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      action: 'UPDATE',
      entityType: 'ARTICLE',
      entityId: ARTICLE_ID,
      result: 'SUCCESS',
    })
  })

  it('retorna 500 sem vazar detalhes quando o upload falha', async () => {
    storageUpload.mockRejectedValueOnce(new Error('falha interna do storage'))
    const response = await callRoute(buildFormData())
    const json = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(json.error).not.toContain('falha interna')
    expect(logger.error).toHaveBeenCalledWith('content.article_image_create_failed')
  })
})
