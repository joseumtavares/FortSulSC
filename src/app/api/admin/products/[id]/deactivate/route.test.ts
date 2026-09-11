import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), update: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ findProductForAdmin: mocks.find, updateProductActive: mocks.update }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
  mocks.update.mockResolvedValue({ id })
})

function request() {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/deactivate', { method: 'POST' })
}

import { POST } from './route'

describe('deactivate product', () => {
  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request(), context)).status).toBe(404)
  })

  it('deactivates, audits and revalidates', async () => {
    const response = await POST(request(), context)
    expect(response.status).toBe(200)
    expect(mocks.update).toHaveBeenCalledWith(id, false)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DEACTIVATE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
