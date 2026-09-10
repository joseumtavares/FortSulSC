import { prisma } from '@/lib/db/client'

export const MAX_ARTICLE_IMAGES = 4

export function listArticleImages(articleId: string) {
  return prisma.articleImage.findMany({
    where: { articleId },
    orderBy: { order: 'asc' },
  })
}

export function countArticleImages(articleId: string) {
  return prisma.articleImage.count({ where: { articleId } })
}

export function findArticleImage(id: string) {
  return prisma.articleImage.findUnique({ where: { id } })
}

export type CreateArticleImageInput = {
  articleId: string
  imageUrl: string
  imageKey: string
  mimeType: string
  size: number
  altText: string
}

export async function createArticleImage(input: CreateArticleImageInput) {
  const order = await countArticleImages(input.articleId)
  return prisma.articleImage.create({ data: { ...input, order } })
}

export function deleteArticleImage(id: string) {
  return prisma.articleImage.delete({ where: { id } })
}
