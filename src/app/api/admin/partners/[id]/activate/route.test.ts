// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), updateActive: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/partner-repository', () => ({ findPartnerForAdmin: mocks.find, updatePartnerActive: mocks.updateActive }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
})

function request() {
  return new NextRequest('http://localhost:3000/api/admin/partners/p1/activate', { method: 'POST' })
}

import { POST } from './route'

describe('POST /api/admin/partners/[id]/activate', () => {
  it('returns 404 for a missing partner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request(), context)).status).toBe(404)
  })

  it('activates, audits', async () => {
    const response = await POST(request(), context)
    expect(response.status).toBe(200)
    expect(mocks.updateActive).toHaveBeenCalledWith(id, true)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'ACTIVATE', entityType: 'PARTNER' }))
  })
})
