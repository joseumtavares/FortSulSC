// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), update: vi.fn(), remove: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/commercial-area-repository', () => ({
  findCommercialAreaForAdmin: mocks.find,
  updateCommercialArea: mocks.update,
  deleteCommercialArea: mocks.remove,
}))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'a1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
  mocks.update.mockResolvedValue({ id })
  mocks.remove.mockResolvedValue({ id })
})

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/commercial-areas/a1', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { DELETE, PATCH } from './route'

describe('PATCH /api/admin/commercial-areas/[id]', () => {
  it('returns 404 for a missing area', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PATCH(request('PATCH', { name: 'X' }), context)).status).toBe(404)
  })

  it('updates and audits', async () => {
    const response = await PATCH(request('PATCH', { name: 'Novo nome' }), context)
    expect(response.status).toBe(200)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'COMMERCIAL_AREA' }))
  })
})

describe('DELETE /api/admin/commercial-areas/[id]', () => {
  it('returns 404 for a missing area', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await DELETE(request('DELETE'), context)).status).toBe(404)
  })

  it('deletes and audits', async () => {
    const response = await DELETE(request('DELETE'), context)
    expect(response.status).toBe(200)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE', entityType: 'COMMERCIAL_AREA' }))
  })

  it('returns 409 when the area still has partners linked', async () => {
    mocks.remove.mockRejectedValue({ code: 'P2003' })
    const response = await DELETE(request('DELETE'), context)
    expect(response.status).toBe(409)
  })
})
