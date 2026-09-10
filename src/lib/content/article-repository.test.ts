import { beforeEach, describe, expect, it, vi } from 'vitest'

const articleMock = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: { article: articleMock },
}))

vi.mock('@prisma/client', () => ({
  ArticleStatus: { PUBLISHED: 'PUBLISHED' },
}))

import {
  ArticleMissingCoverImageError,
  findArticleBySlugPublic,
  generateUniqueArticleSlug,
  listArticlesForAdmin,
  listPublishedArticlesPublic,
  publishArticle,
  updateArticle,
  updateArticleCoverImage,
} from './article-repository'

describe('findArticleBySlugPublic', () => {
  beforeEach(() => {
    articleMock.findFirst.mockReset()
    articleMock.findUniqueOrThrow.mockReset()
    articleMock.update.mockReset()
    articleMock.findFirst.mockResolvedValue(null)
  })

  it('nunca inclui authorId na consulta pública', async () => {
    await findArticleBySlugPublic('qualquer-slug')

    const call = articleMock.findFirst.mock.calls[0]?.[0]
    expect(call?.select).toBeDefined()
    expect(call?.select).not.toHaveProperty('authorId')
  })

  it('busca somente artigos publicados', async () => {
    await findArticleBySlugPublic('qualquer-slug')

    const call = articleMock.findFirst.mock.calls[0]?.[0]
    expect(call?.where).toMatchObject({ slug: 'qualquer-slug', status: 'PUBLISHED' })
  })

  it('inclui apenas os campos públicos de imagem de capa no select', async () => {
    await findArticleBySlugPublic('qualquer-slug')

    const call = articleMock.findFirst.mock.calls[0]?.[0]
    expect(call?.select).toMatchObject({
      coverImageUrl: true,
      coverImageAlt: true,
    })
    expect(call?.select).not.toHaveProperty('coverImageKey')
    expect(call?.select).not.toHaveProperty('coverImageMime')
    expect(call?.select).not.toHaveProperty('coverImageSize')
  })
})

describe('publishArticle', () => {
  beforeEach(() => {
    articleMock.findFirst.mockReset()
    articleMock.findUniqueOrThrow.mockReset()
    articleMock.update.mockReset()
  })

  it('rejeita publicação sem imagem de capa', async () => {
    articleMock.findUniqueOrThrow.mockResolvedValueOnce({
      coverImageUrl: null,
      coverImageAlt: null,
    })

    await expect(publishArticle('article-id')).rejects.toBeInstanceOf(ArticleMissingCoverImageError)
    expect(articleMock.update).not.toHaveBeenCalled()
  })

  it('rejeita publicação com texto alternativo em branco', async () => {
    articleMock.findUniqueOrThrow.mockResolvedValueOnce({
      coverImageUrl: 'https://example.test/capa.jpg',
      coverImageAlt: '   ',
    })

    await expect(publishArticle('article-id')).rejects.toBeInstanceOf(ArticleMissingCoverImageError)
    expect(articleMock.update).not.toHaveBeenCalled()
  })

  it('publica artigo quando imagem de capa e alt estão presentes', async () => {
    articleMock.findUniqueOrThrow.mockResolvedValueOnce({
      coverImageUrl: 'https://example.test/capa.jpg',
      coverImageAlt: 'Capa do artigo',
    })
    articleMock.update.mockResolvedValueOnce({ id: 'article-id', status: 'PUBLISHED' })

    const published = await publishArticle('article-id')

    expect(articleMock.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'article-id' },
      select: { coverImageUrl: true, coverImageAlt: true },
    })
    expect(articleMock.update).toHaveBeenCalledWith({
      where: { id: 'article-id' },
      data: expect.objectContaining({ status: 'PUBLISHED' }),
    })
    expect(published).toMatchObject({ id: 'article-id', status: 'PUBLISHED' })
  })
})

describe('updateArticleCoverImage', () => {
  beforeEach(() => {
    articleMock.update.mockReset()
  })

  it('atualiza os cinco campos de capa a partir do id do artigo', async () => {
    articleMock.update.mockResolvedValueOnce({ id: 'article-id' })

    await updateArticleCoverImage('article-id', {
      coverImageUrl: 'https://images.fortsulsc.test/articles/article-id/capa.jpg',
      coverImageKey: 'articles/article-id/capa.jpg',
      coverImageMime: 'image/jpeg',
      coverImageSize: 4096,
      coverImageAlt: 'Descrição da capa',
    })

    expect(articleMock.update).toHaveBeenCalledWith({
      where: { id: 'article-id' },
      data: {
        coverImageUrl: 'https://images.fortsulsc.test/articles/article-id/capa.jpg',
        coverImageKey: 'articles/article-id/capa.jpg',
        coverImageMime: 'image/jpeg',
        coverImageSize: 4096,
        coverImageAlt: 'Descrição da capa',
      },
    })
  })
})

describe('listArticlesForAdmin', () => {
  beforeEach(() => {
    articleMock.findMany.mockReset()
  })

  it('lista sem expor o corpo do artigo, ordenado por atualização recente', async () => {
    articleMock.findMany.mockResolvedValueOnce([])

    await listArticlesForAdmin()

    expect(articleMock.findMany).toHaveBeenCalledWith({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    })
  })
})

describe('generateUniqueArticleSlug', () => {
  beforeEach(() => {
    articleMock.findUnique.mockReset()
  })

  it('usa o slug do título quando não há colisão', async () => {
    articleMock.findUnique.mockResolvedValueOnce(null)

    const slug = await generateUniqueArticleSlug('Manutenção de Secadores')

    expect(slug).toBe('manutencao-de-secadores')
    expect(articleMock.findUnique).toHaveBeenCalledTimes(1)
  })

  it('acrescenta sufixo numérico quando o slug já existe', async () => {
    articleMock.findUnique
      .mockResolvedValueOnce({ id: 'existing-1' })
      .mockResolvedValueOnce({ id: 'existing-2' })
      .mockResolvedValueOnce(null)

    const slug = await generateUniqueArticleSlug('Novidades')

    expect(slug).toBe('novidades-3')
    expect(articleMock.findUnique).toHaveBeenCalledTimes(3)
  })
})

describe('listPublishedArticlesPublic', () => {
  beforeEach(() => {
    articleMock.findMany.mockReset()
  })

  it('filtra por publicado, ordena por data de publicação e nunca seleciona campos internos', async () => {
    articleMock.findMany.mockResolvedValueOnce([])

    await listPublishedArticlesPublic()

    const call = articleMock.findMany.mock.calls[0]?.[0]
    expect(call?.where).toEqual({ status: 'PUBLISHED' })
    expect(call?.orderBy).toEqual({ publishedAt: 'desc' })
    expect(call?.select).toMatchObject({
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      coverImageUrl: true,
      coverImageAlt: true,
    })
    expect(call?.select).not.toHaveProperty('authorId')
    expect(call?.select).not.toHaveProperty('coverImageKey')
    expect(call?.select).not.toHaveProperty('coverImageMime')
    expect(call?.select).not.toHaveProperty('coverImageSize')
    expect(call?.select?.images).toMatchObject({
      orderBy: { order: 'asc' },
      select: { imageUrl: true, altText: true },
    })
  })
})

describe('updateArticle', () => {
  beforeEach(() => {
    articleMock.update.mockReset()
  })

  it('atualiza título, resumo e corpo do artigo', async () => {
    articleMock.update.mockResolvedValueOnce({ id: 'article-id' })

    await updateArticle('article-id', {
      title: 'Novo título',
      excerpt: 'Novo resumo',
      body: 'Novo corpo do artigo',
    })

    expect(articleMock.update).toHaveBeenCalledWith({
      where: { id: 'article-id' },
      data: { title: 'Novo título', excerpt: 'Novo resumo', body: 'Novo corpo do artigo' },
    })
  })
})
