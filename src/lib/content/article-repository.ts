import { ArticleStatus } from '@prisma/client'
import { prisma } from '@/lib/db/client'

export type CreateArticleInput = {
  slug: string
  title: string
  excerpt?: string | null
  body: string
  authorId: string
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
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export function findArticleForAdmin(id: string) {
  return prisma.article.findUnique({ where: { id } })
}

export function publishArticle(id: string) {
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
