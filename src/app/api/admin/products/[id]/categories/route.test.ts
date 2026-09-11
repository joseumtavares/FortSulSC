// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), setCategories: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ findProductForAdmin: mocks.find, setProductCategories: mocks.setCategories }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
})

function request(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/categories', {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { PUT } from './route'

describe('PUT /api/admin/products/[id]/categories', () => {
  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PUT(request({ categoryIds: ['cat-1'] }), context)).status).toBe(404)
  })

  it('rejects a non-array or invalid categoryIds', async () => {
    expect((await PUT(request({ categoryIds: 'cat-1' }), context)).status).toBe(400)
    expect((await PUT(request({ categoryIds: [''] }), context)).status).toBe(400)
    expect(mocks.setCategories).not.toHaveBeenCalled()
  })

  it('replaces categories, audits and revalidates', async () => {
    const response = await PUT(request({ categoryIds: ['cat-1', 'cat-2'] }), context)
    expect(response.status).toBe(200)
    expect(mocks.setCategories).toHaveBeenCalledWith(id, ['cat-1', 'cat-2'])
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
