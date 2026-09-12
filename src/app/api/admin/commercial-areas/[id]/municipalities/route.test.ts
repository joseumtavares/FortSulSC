// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), setMunicipalities: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/commercial-area-repository', () => ({ findCommercialAreaForAdmin: mocks.find, setCommercialAreaMunicipalities: mocks.setMunicipalities }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'a1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
})

function request(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/commercial-areas/a1/municipalities', {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { PUT } from './route'

describe('PUT /api/admin/commercial-areas/[id]/municipalities', () => {
  it('returns 404 for a missing area', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PUT(request({ municipalityIds: [] }), context)).status).toBe(404)
  })

  it('rejects an invalid list', async () => {
    expect((await PUT(request({ municipalityIds: [''] }), context)).status).toBe(400)
    expect(mocks.setMunicipalities).not.toHaveBeenCalled()
  })

  it('replaces municipalities and audits', async () => {
    const response = await PUT(request({ municipalityIds: ['m1', 'm2'] }), context)
    expect(response.status).toBe(200)
    expect(mocks.setMunicipalities).toHaveBeenCalledWith(id, ['m1', 'm2'])
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'COMMERCIAL_AREA' }))
  })
})
