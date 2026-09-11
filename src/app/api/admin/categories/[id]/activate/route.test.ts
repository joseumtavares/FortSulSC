import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), update: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/category-repository', () => ({ findCategoryForAdmin: mocks.find, updateCategoryActive: mocks.update }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'cat-1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
  mocks.update.mockResolvedValue({ id })
})

function request() {
  return new NextRequest('http://localhost:3000/api/admin/categories/cat-1/activate', { method: 'POST' })
}

import { POST } from './route'

describe('activate category', () => {
  it('returns 404 for a missing category', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request(), context)).status).toBe(404)
  })

  it('activates, audits and revalidates the home', async () => {
    const response = await POST(request(), context)
    expect(response.status).toBe(200)
    expect(mocks.update).toHaveBeenCalledWith(id, true)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'ACTIVATE', entityType: 'CATEGORY' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
