import { prisma } from '@/lib/db/client'

export function listProductTestimonials(productId: string) {
  return prisma.productTestimonial.findMany({ where: { productId }, orderBy: { order: 'asc' } })
}

export function countProductTestimonials(productId: string) {
  return prisma.productTestimonial.count({ where: { productId } })
}

export function findProductTestimonial(id: string) {
  return prisma.productTestimonial.findUnique({ where: { id } })
}

export type CreateProductTestimonialInput = {
  productId: string
  platform: 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM'
  url: string
  authorName: string | null
}

export async function createProductTestimonial(input: CreateProductTestimonialInput) {
  const order = await countProductTestimonials(input.productId)
  return prisma.productTestimonial.create({ data: { ...input, order } })
}

export function deleteProductTestimonial(id: string) {
  return prisma.productTestimonial.delete({ where: { id } })
}
