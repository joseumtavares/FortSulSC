import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), remove: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-testimonial-repository', () => ({ findProductTestimonial: mocks.find, deleteProductTestimonial: mocks.remove }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const testimonialId = 't1'
const context = { params: Promise.resolve({ id, testimonialId }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id: testimonialId, productId: id })
})

function request() {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/testimonials/t1', { method: 'DELETE' })
}

import { DELETE } from './route'

describe('DELETE /api/admin/products/[id]/testimonials/[testimonialId]', () => {
  it('returns 404 for a missing testimonial', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await DELETE(request(), context)).status).toBe(404)
  })

  it('returns 404 when the testimonial belongs to another product', async () => {
    mocks.find.mockResolvedValue({ id: testimonialId, productId: 'other' })
    expect((await DELETE(request(), context)).status).toBe(404)
  })

  it('deletes, audits and revalidates', async () => {
    const response = await DELETE(request(), context)
    expect(response.status).toBe(200)
    expect(mocks.remove).toHaveBeenCalledWith(testimonialId)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
