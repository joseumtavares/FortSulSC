import { prisma } from '@/lib/db/client'

export function listProductImages(productId: string) {
  return prisma.productImage.findMany({ where: { productId }, orderBy: { order: 'asc' } })
}

export function countProductImages(productId: string) {
  return prisma.productImage.count({ where: { productId } })
}

export function findProductImage(id: string) {
  return prisma.productImage.findUnique({ where: { id } })
}

export type CreateProductImageInput = {
  productId: string
  imageUrl: string
  imageKey: string
  mimeType: string
  size: number
  altText: string
  role: 'HERO' | 'GALLERY'
}

export async function createProductImage(input: CreateProductImageInput) {
  const order = await countProductImages(input.productId)
  return prisma.productImage.create({ data: { ...input, order } })
}

export function deleteProductImage(id: string) {
  return prisma.productImage.delete({ where: { id } })
}
