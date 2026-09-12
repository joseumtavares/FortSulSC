// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), setAreas: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/partner-repository', () => ({ findPartnerForAdmin: mocks.find, setPartnerCommercialAreas: mocks.setAreas }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
})

function request(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/partners/p1/commercial-areas', {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { PUT } from './route'

describe('PUT /api/admin/partners/[id]/commercial-areas', () => {
  it('returns 404 for a missing partner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PUT(request({ commercialAreaIds: [] }), context)).status).toBe(404)
  })

  it('rejects an invalid list', async () => {
    expect((await PUT(request({ commercialAreaIds: [''] }), context)).status).toBe(400)
    expect(mocks.setAreas).not.toHaveBeenCalled()
  })

  it('replaces commercial areas and audits', async () => {
    const response = await PUT(request({ commercialAreaIds: ['a1'] }), context)
    expect(response.status).toBe(200)
    expect(mocks.setAreas).toHaveBeenCalledWith(id, ['a1'])
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PARTNER' }))
  })
})
