// @vitest-environment node
//
// jsdom não implementa FormData/File de forma compatível com o parser de
// multipart do runtime fetch do Next.js (usado por `request.formData()`);
// este é o primeiro teste do projeto que envia um corpo multipart, por isso
// precisa do ambiente Node em vez do jsdom padrão do restante da suíte.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { isSameOriginRequest, auth, findArticleForAdmin, updateArticleCoverImage, getImageStorage, logger } = vi.hoisted(
  () => ({
    isSameOriginRequest: vi.fn(),
    auth: vi.fn(),
    findArticleForAdmin: vi.fn(),
    updateArticleCoverImage: vi.fn(),
    getImageStorage: vi.fn(),
    logger: { info: vi.fn(), error: vi.fn() },
  }),
)

vi.mock('@/lib/auth/origin-check', () => ({ isSameOriginRequest }))
vi.mock('@/lib/auth/config', () => ({ auth }))
vi.mock('@/lib/content/article-repository', () => ({ findArticleForAdmin, updateArticleCoverImage }))
vi.mock('@/lib/storage/image-storage', () => ({ getImageStorage }))
vi.mock('@/lib/logger', () => ({ logger }))

import { POST } from './route'

const ARTICLE_ID = '11111111-1111-4111-8111-111111111111'
const ORIGIN = 'http://localhost:3000'

function buildRequest(formData: FormData): NextRequest {
  return new NextRequest(`${ORIGIN}/api/admin/articles/${ARTICLE_ID}/cover`, {
    method: 'POST',
    headers: { origin: ORIGIN },
    body: formData,
  })
}

function buildFormData(overrides: { file?: File | null; alt?: string | null } = {}): FormData {
  const formData = new FormData()
  const file = overrides.file === undefined ? new File([new Uint8Array([0xff, 0xd8, 0xff])], 'capa.jpg', { type: 'image/jpeg' }) : overrides.file
  const alt = overrides.alt === undefined ? 'Descrição da capa' : overrides.alt

  if (file) formData.set('file', file)
  if (alt !== null) formData.set('alt', alt)
  return formData
}

function callRoute(formData: FormData) {
  return POST(buildRequest(formData), { params: Promise.resolve({ id: ARTICLE_ID }) })
}

describe('POST /api/admin/articles/[id]/cover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isSameOriginRequest.mockReturnValue(true)
    auth.mockResolvedValue({ user: { id: 'admin-1', name: 'Admin', email: 'admin@fortsulsc.test', role: 'ADMIN' } })
    findArticleForAdmin.mockResolvedValue({ id: ARTICLE_ID, coverImageKey: null })
    updateArticleCoverImage.mockResolvedValue({ id: ARTICLE_ID })
    getImageStorage.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ url: 'https://images.fortsulsc.test/articles/x/capa.jpg' }),
      delete: vi.fn().mockResolvedValue(undefined),
    })
  })

  it('rejeita origem inválida', async () => {
    isSameOriginRequest.mockReturnValue(false)
    const response = await callRoute(buildFormData())
    expect(response.status).toBe(403)
  })

  it('rejeita sem sessão autenticada', async () => {
    auth.mockResolvedValue(null)
    const response = await callRoute(buildFormData())
    expect(response.status).toBe(401)
  })

  it('rejeita papel sem permissão', async () => {
    auth.mockResolvedValue({ user: { id: 'guest-1', name: 'Guest', email: 'guest@fortsulsc.test', role: 'GUEST' } })
    const response = await callRoute(buildFormData())
    expect(response.status).toBe(403)
  })

  it('retorna 404 quando o artigo não existe', async () => {
    findArticleForAdmin.mockResolvedValue(null)
    const response = await callRoute(buildFormData())
    expect(response.status).toBe(404)
  })

  it('retorna 404 quando o id não tem formato de UUID', async () => {
    const response = await POST(buildRequest(buildFormData()), { params: Promise.resolve({ id: 'nao-e-um-uuid' }) })
    expect(response.status).toBe(404)
    expect(findArticleForAdmin).not.toHaveBeenCalled()
  })

  it('rejeita sem arquivo', async () => {
    const response = await callRoute(buildFormData({ file: null }))
    const body = (await response.json()) as { error: string }
    expect(response.status).toBe(400)
    expect(body.error).toBe('Arquivo obrigatório.')
  })

  it('rejeita sem texto alternativo', async () => {
    const response = await callRoute(buildFormData({ alt: '   ' }))
    const body = (await response.json()) as { error: string }
    expect(response.status).toBe(400)
    expect(body.error).toBe('Texto alternativo obrigatório.')
  })

  it('rejeita tipo de arquivo não suportado', async () => {
    const file = new File([new Uint8Array([1])], 'capa.gif', { type: 'image/gif' })
    const response = await callRoute(buildFormData({ file }))
    expect(response.status).toBe(400)
  })

  it('rejeita arquivo cujo conteúdo não corresponde ao tipo declarado', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'capa.jpg', { type: 'image/jpeg' })
    const response = await callRoute(buildFormData({ file }))
    expect(response.status).toBe(400)
  })

  it('rejeita arquivo maior que 5 MB', async () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'capa.jpg', { type: 'image/jpeg' })
    const response = await callRoute(buildFormData({ file }))
    const body = (await response.json()) as { error: string }
    expect(response.status).toBe(400)
    expect(body.error).toBe('Arquivo maior que 5 MB.')
  })

  it('faz upload, atualiza o artigo e não tenta excluir capa antiga quando não havia uma', async () => {
    const storage = { upload: vi.fn().mockResolvedValue({ url: 'https://images.fortsulsc.test/x.jpg' }), delete: vi.fn() }
    getImageStorage.mockReturnValue(storage)

    const response = await callRoute(buildFormData())
    const body = (await response.json()) as { coverImageUrl: string; coverImageAlt: string }

    expect(response.status).toBe(200)
    expect(body).toEqual({ coverImageUrl: 'https://images.fortsulsc.test/x.jpg', coverImageAlt: 'Descrição da capa' })
    expect(storage.upload).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: 'image/jpeg', key: expect.stringMatching(new RegExp(`^articles/${ARTICLE_ID}/.+\\.jpg$`)) }),
    )
    expect(updateArticleCoverImage).toHaveBeenCalledWith(
      ARTICLE_ID,
      expect.objectContaining({ coverImageUrl: 'https://images.fortsulsc.test/x.jpg', coverImageAlt: 'Descrição da capa' }),
    )
    expect(storage.delete).not.toHaveBeenCalled()
  })

  it('exclui a capa antiga quando o artigo já tinha uma', async () => {
    findArticleForAdmin.mockResolvedValue({ id: ARTICLE_ID, coverImageKey: 'articles/old/capa-antiga.jpg' })
    const storage = { upload: vi.fn().mockResolvedValue({ url: 'https://images.fortsulsc.test/x.jpg' }), delete: vi.fn().mockResolvedValue(undefined) }
    getImageStorage.mockReturnValue(storage)

    const response = await callRoute(buildFormData())

    expect(response.status).toBe(200)
    expect(storage.delete).toHaveBeenCalledWith('articles/old/capa-antiga.jpg')
  })

  it('responde 200 mesmo se a exclusão da capa antiga falhar', async () => {
    findArticleForAdmin.mockResolvedValue({ id: ARTICLE_ID, coverImageKey: 'articles/old/capa-antiga.jpg' })
    const storage = {
      upload: vi.fn().mockResolvedValue({ url: 'https://images.fortsulsc.test/x.jpg' }),
      delete: vi.fn().mockRejectedValue(new Error('falha de rede')),
    }
    getImageStorage.mockReturnValue(storage)

    const response = await callRoute(buildFormData())

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalledWith('storage.cover_delete_failed')
  })

  it('retorna 500 sem vazar detalhes quando o upload falha', async () => {
    const storage = { upload: vi.fn().mockRejectedValue(new Error('R2 indisponível')), delete: vi.fn() }
    getImageStorage.mockReturnValue(storage)

    const response = await callRoute(buildFormData())
    const body = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    expect(body.error).not.toContain('R2 indisponível')
    expect(logger.error).toHaveBeenCalledWith('storage.cover_upload_failed')
  })
})
