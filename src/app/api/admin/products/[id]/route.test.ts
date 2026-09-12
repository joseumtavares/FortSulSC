// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), update: vi.fn(), remove: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn(), storageDelete: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ findProductForAdmin: mocks.find, updateProduct: mocks.update, deleteProduct: mocks.remove }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/storage/image-storage', () => ({ getImageStorage: () => ({ delete: mocks.storageDelete }) }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id, images: [{ imageKey: 'products/p1/a.webp' }, { imageKey: 'products/p1/b.webp' }] })
  mocks.update.mockResolvedValue({ id })
  mocks.remove.mockResolvedValue({ id })
  mocks.storageDelete.mockResolvedValue(undefined)
})

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/products/p1', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { DELETE, PATCH } from './route'

describe('PATCH /api/admin/products/[id]', () => {
  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PATCH(request('PATCH', { code: 'X', name: 'X' }), context)).status).toBe(404)
  })

  it('updates, audits and revalidates', async () => {
    const response = await PATCH(request('PATCH', { code: 'ALM-1', name: 'Alimentador' }), context)
    expect(response.status).toBe(200)
    expect(mocks.update).toHaveBeenCalled()
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})

describe('DELETE /api/admin/products/[id]', () => {
  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await DELETE(request('DELETE'), context)).status).toBe(404)
  })

  it('deletes, removes storage images, audits and revalidates', async () => {
    const response = await DELETE(request('DELETE'), context)
    expect(response.status).toBe(200)
    expect(mocks.remove).toHaveBeenCalledWith(id)
    expect(mocks.storageDelete).toHaveBeenCalledWith('products/p1/a.webp')
    expect(mocks.storageDelete).toHaveBeenCalledWith('products/p1/b.webp')
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })

  it('restricts deletion to ADMIN', async () => {
    await DELETE(request('DELETE'), context)
    expect(mocks.guard).toHaveBeenCalledWith(expect.anything(), ['ADMIN'])
  })
})
