import { beforeEach, describe, expect, it, vi } from 'vitest'

const articleImageMock = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: { articleImage: articleImageMock },
}))

import {
  MAX_ARTICLE_IMAGES,
  countArticleImages,
  createArticleImage,
  deleteArticleImage,
  findArticleImage,
  listArticleImages,
} from './article-image-repository'

describe('MAX_ARTICLE_IMAGES', () => {
  it('é 4', () => {
    expect(MAX_ARTICLE_IMAGES).toBe(4)
  })
})

describe('listArticleImages', () => {
  beforeEach(() => {
    articleImageMock.findMany.mockReset()
  })

  it('lista imagens do artigo ordenadas por order crescente', async () => {
    articleImageMock.findMany.mockResolvedValueOnce([])

    await listArticleImages('article-id')

    expect(articleImageMock.findMany).toHaveBeenCalledWith({
      where: { articleId: 'article-id' },
      orderBy: { order: 'asc' },
    })
  })
})

describe('createArticleImage', () => {
  beforeEach(() => {
    articleImageMock.count.mockReset()
    articleImageMock.create.mockReset()
  })

  it('usa a contagem atual como order da nova imagem', async () => {
    articleImageMock.count.mockResolvedValueOnce(2)
    articleImageMock.create.mockResolvedValueOnce({ id: 'image-3' })

    await createArticleImage({
      articleId: 'article-id',
      imageUrl: 'https://images.test/a.jpg',
      imageKey: 'articles/article-id/gallery/a.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      altText: 'Foto do produto',
    })

    expect(articleImageMock.create).toHaveBeenCalledWith({
      data: {
        articleId: 'article-id',
        imageUrl: 'https://images.test/a.jpg',
        imageKey: 'articles/article-id/gallery/a.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        altText: 'Foto do produto',
        order: 2,
      },
    })
  })
})

describe('findArticleImage', () => {
  beforeEach(() => {
    articleImageMock.findUnique.mockReset()
  })

  it('busca imagem pelo id', async () => {
    articleImageMock.findUnique.mockResolvedValueOnce(null)

    await findArticleImage('image-id')

    expect(articleImageMock.findUnique).toHaveBeenCalledWith({ where: { id: 'image-id' } })
  })
})

describe('deleteArticleImage', () => {
  beforeEach(() => {
    articleImageMock.delete.mockReset()
  })

  it('remove a imagem pelo id', async () => {
    articleImageMock.delete.mockResolvedValueOnce({ id: 'image-id' })

    await deleteArticleImage('image-id')

    expect(articleImageMock.delete).toHaveBeenCalledWith({ where: { id: 'image-id' } })
  })
})

describe('countArticleImages', () => {
  beforeEach(() => {
    articleImageMock.count.mockReset()
  })

  it('conta imagens do artigo', async () => {
    articleImageMock.count.mockResolvedValueOnce(3)

    const count = await countArticleImages('article-id')

    expect(count).toBe(3)
    expect(articleImageMock.count).toHaveBeenCalledWith({ where: { articleId: 'article-id' } })
  })
})
