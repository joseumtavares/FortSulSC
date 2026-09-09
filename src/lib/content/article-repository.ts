import { ArticleStatus } from '@prisma/client'
import { prisma } from '@/lib/db/client'

export type CreateArticleInput = {
  slug: string
  title: string
  excerpt?: string | null
  body: string
  authorId: string
  coverImageUrl?: string | null
  coverImageKey?: string | null
  coverImageMime?: string | null
  coverImageSize?: number | null
  coverImageAlt?: string | null
}

export function createArticle(input: CreateArticleInput) {
  return prisma.article.create({ data: input })
}

export function findArticleBySlugPublic(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      coverImageUrl: true,
      coverImageAlt: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export class ArticleMissingCoverImageError extends Error {
  constructor() {
    super('Artigo precisa de imagem de capa e texto alternativo para ser publicado')
  }
}

export function findArticleForAdmin(id: string) {
  return prisma.article.findUnique({ where: { id } })
}

export async function publishArticle(id: string) {
  const article = await prisma.article.findUniqueOrThrow({
    where: { id },
    select: {
      coverImageUrl: true,
      coverImageAlt: true,
    },
  })

  if (!article.coverImageUrl || !article.coverImageAlt || article.coverImageAlt.trim() === '') {
    throw new ArticleMissingCoverImageError()
  }

  return prisma.article.update({
    where: { id },
    data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
  })
}

export function unpublishArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: { status: ArticleStatus.DRAFT, publishedAt: null },
  })
}
