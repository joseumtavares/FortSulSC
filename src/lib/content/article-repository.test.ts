import { beforeEach, describe, expect, it, vi } from 'vitest'

const articleMock = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: { article: articleMock },
}))

vi.mock('@prisma/client', () => ({
  ArticleStatus: { PUBLISHED: 'PUBLISHED' },
}))

import { ArticleMissingCoverImageError, findArticleBySlugPublic, publishArticle } from './article-repository'

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
