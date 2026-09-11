// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), count: vi.fn(), create: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ findProductForAdmin: mocks.find }))
vi.mock('@/lib/content/product-testimonial-repository', () => ({ countProductTestimonials: mocks.count, createProductTestimonial: mocks.create }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
  mocks.count.mockResolvedValue(0)
  mocks.create.mockResolvedValue({ id: 't1' })
})

function request(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/testimonials', {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { POST } from './route'

describe('POST /api/admin/products/[id]/testimonials', () => {
  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request({ platform: 'TIKTOK', url: 'https://tiktok.com/@x/video/1' }), context)).status).toBe(404)
  })

  it('rejects when the limit of 3 testimonials is reached', async () => {
    mocks.count.mockResolvedValue(3)
    const response = await POST(request({ platform: 'TIKTOK', url: 'https://tiktok.com/@x/video/1' }), context)
    expect(response.status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('rejects invalid input', async () => {
    expect((await POST(request({ platform: 'youtube', url: 'https://youtube.com/x' }), context)).status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('creates, audits and revalidates', async () => {
    const response = await POST(request({ platform: 'tiktok', url: 'https://tiktok.com/@x/video/1', authorName: 'Parceiro' }), context)
    expect(response.status).toBe(201)
    expect(mocks.create).toHaveBeenCalledWith({ productId: id, platform: 'TIKTOK', url: 'https://tiktok.com/@x/video/1', authorName: 'Parceiro' })
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
