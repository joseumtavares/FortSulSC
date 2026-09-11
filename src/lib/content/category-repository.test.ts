import { beforeEach, describe, expect, it, vi } from 'vitest'

const categoryMock = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({ prisma: { category: categoryMock } }))

import {
  createCategory,
  deleteCategory,
  findCategoryForAdmin,
  listActiveCategoriesPublic,
  listCategoriesForAdmin,
  updateCategory,
  updateCategoryActive,
} from './category-repository'

describe('category-repository', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('lists categories for admin ordered by active, order and name', async () => {
    await listCategoriesForAdmin()
    expect(categoryMock.findMany).toHaveBeenCalledWith({ orderBy: [{ active: 'desc' }, { order: 'asc' }, { name: 'asc' }] })
  })

  it('finds category by id for admin', async () => {
    await findCategoryForAdmin('cat-1')
    expect(categoryMock.findUnique).toHaveBeenCalledWith({ where: { id: 'cat-1' } })
  })

  it('creates category with given fields', async () => {
    const input = { name: 'Aviário', slug: 'aviario', order: 1 }
    await createCategory(input)
    expect(categoryMock.create).toHaveBeenCalledWith({ data: input })
  })

  it('updates category text fields', async () => {
    const input = { name: 'Novo nome', slug: 'novo-slug', order: 2 }
    await updateCategory('cat-1', input)
    expect(categoryMock.update).toHaveBeenCalledWith({ where: { id: 'cat-1' }, data: input })
  })

  it('updates only active', async () => {
    await updateCategoryActive('cat-1', false)
    expect(categoryMock.update).toHaveBeenCalledWith({ where: { id: 'cat-1' }, data: { active: false } })
  })

  it('deletes category by id', async () => {
    await deleteCategory('cat-1')
    expect(categoryMock.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } })
  })

  it('never selects internal fields in the public query', async () => {
    await listActiveCategoriesPublic()
    const call = categoryMock.findMany.mock.calls[0]?.[0]
    expect(call?.where).toEqual({ active: true })
    expect(call?.select).toEqual({ id: true, name: true, slug: true })
  })
})
