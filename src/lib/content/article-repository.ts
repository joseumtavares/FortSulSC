import { ArticleStatus } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { slugify } from './slug'

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

export function listPublishedArticlesPublic() {
  return prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      coverImageUrl: true,
      coverImageAlt: true,
      images: {
        orderBy: { order: 'asc' },
        select: { imageUrl: true, altText: true },
      },
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

export function listArticlesForAdmin() {
  return prisma.article.findMany({
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
}

/**
 * Deriva um slug único a partir do título, tentando o valor base primeiro e
 * acrescentando um sufixo numérico só se já existir outro artigo com o mesmo
 * slug (evita colisão de URL pública sem exigir que o admin pense nisso).
 */
export async function generateUniqueArticleSlug(title: string): Promise<string> {
  const base = slugify(title) || 'artigo'
  let candidate = base
  let suffix = 2

  while (await prisma.article.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }

  return candidate
}

export type UpdateArticleInput = {
  title: string
  excerpt?: string | null
  body: string
}

export function updateArticle(id: string, input: UpdateArticleInput) {
  return prisma.article.update({ where: { id }, data: input })
}

export type UpdateArticleCoverImageInput = {
  coverImageUrl: string
  coverImageKey: string
  coverImageMime: string
  coverImageSize: number
  coverImageAlt: string
}

export function updateArticleCoverImage(id: string, input: UpdateArticleCoverImageInput) {
  return prisma.article.update({ where: { id }, data: input })
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
