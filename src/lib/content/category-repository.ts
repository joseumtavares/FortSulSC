import { prisma } from '@/lib/db/client'

export type CategoryTextInput = { name: string; slug: string; order: number }

export function listCategoriesForAdmin() {
  return prisma.category.findMany({ orderBy: [{ active: 'desc' }, { order: 'asc' }, { name: 'asc' }] })
}

export function findCategoryForAdmin(id: string) {
  return prisma.category.findUnique({ where: { id } })
}

export function createCategory(input: CategoryTextInput) {
  return prisma.category.create({ data: input })
}

export function updateCategory(id: string, input: CategoryTextInput) {
  return prisma.category.update({ where: { id }, data: input })
}

export function updateCategoryActive(id: string, active: boolean) {
  return prisma.category.update({ where: { id }, data: { active } })
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } })
}

/**
 * Consulta pública: só categorias ativas, campos mínimos para o menu de
 * filtros. Nunca `createdAt`/`updatedAt` — a home só precisa de rótulo e slug.
 */
export function listActiveCategoriesPublic() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  })
}
