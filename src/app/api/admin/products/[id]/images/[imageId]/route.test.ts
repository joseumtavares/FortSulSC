import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), remove: vi.fn(), audit: vi.fn(), storageDelete: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-image-repository', () => ({ findProductImage: mocks.find, deleteProductImage: mocks.remove }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/storage/image-storage', () => ({ getImageStorage: () => ({ delete: mocks.storageDelete }) }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const imageId = 'img-1'
const context = { params: Promise.resolve({ id, imageId }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id: imageId, productId: id, imageKey: 'products/p1/a.webp' })
})

function request() {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/images/img-1', { method: 'DELETE' })
}

import { DELETE } from './route'

describe('DELETE /api/admin/products/[id]/images/[imageId]', () => {
  it('returns 404 for a missing image', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await DELETE(request(), context)).status).toBe(404)
  })

  it('returns 404 when the image belongs to another product', async () => {
    mocks.find.mockResolvedValue({ id: imageId, productId: 'other', imageKey: 'x' })
    expect((await DELETE(request(), context)).status).toBe(404)
  })

  it('deletes, audits and revalidates', async () => {
    const response = await DELETE(request(), context)
    expect(response.status).toBe(200)
    expect(mocks.remove).toHaveBeenCalledWith(imageId)
    expect(mocks.storageDelete).toHaveBeenCalledWith('products/p1/a.webp')
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT', entityId: id }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
