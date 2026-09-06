import { beforeEach, describe, expect, it, vi } from 'vitest'

const articleMock = vi.hoisted(() => ({
  findFirst: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: { article: articleMock },
}))

import { findArticleBySlugPublic } from './article-repository'

describe('findArticleBySlugPublic', () => {
  beforeEach(() => {
    articleMock.findFirst.mockReset()
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
})
