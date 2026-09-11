// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), update: vi.fn(), remove: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/category-repository', () => ({ findCategoryForAdmin: mocks.find, updateCategory: mocks.update, deleteCategory: mocks.remove }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'cat-1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id, name: 'Aviário' })
  mocks.update.mockResolvedValue({ id })
  mocks.remove.mockResolvedValue({ id })
})

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/categories/cat-1', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { DELETE, PATCH } from './route'

describe('PATCH /api/admin/categories/[id]', () => {
  it('returns 404 for a missing category', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PATCH(request('PATCH', { name: 'X', slug: 'x' }), context)).status).toBe(404)
  })

  it('updates and audits, revalidating the home', async () => {
    const response = await PATCH(request('PATCH', { name: 'Aviário', slug: 'aviario', order: 2 }), context)
    expect(response.status).toBe(200)
    expect(mocks.update).toHaveBeenCalledWith(id, { name: 'Aviário', slug: 'aviario', order: 2 })
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'CATEGORY' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})

describe('DELETE /api/admin/categories/[id]', () => {
  it('returns 404 for a missing category', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await DELETE(request('DELETE'), context)).status).toBe(404)
  })

  it('returns 409 with a clear message when products are linked', async () => {
    mocks.remove.mockRejectedValue(Object.assign(new Error('FK'), { code: 'P2003' }))
    const response = await DELETE(request('DELETE'), context)
    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatch(/produtos vinculados/)
    expect(mocks.audit).not.toHaveBeenCalled()
  })

  it('deletes and audits when there is no product linked', async () => {
    const response = await DELETE(request('DELETE'), context)
    expect(response.status).toBe(200)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE', entityType: 'CATEGORY' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
