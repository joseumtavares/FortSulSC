// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), update: vi.fn(), remove: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/partner-repository', () => ({ findPartnerForAdmin: mocks.find, updatePartner: mocks.update, deletePartner: mocks.remove }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }
const validPartner = { type: 'REPRESENTATIVE', name: 'Fulano de Tal', whatsapp: '5548999990000' }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
  mocks.update.mockResolvedValue({ id })
  mocks.remove.mockResolvedValue({ id })
})

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/partners/p1', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { DELETE, PATCH } from './route'

describe('PATCH /api/admin/partners/[id]', () => {
  it('returns 404 for a missing partner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PATCH(request('PATCH', validPartner), context)).status).toBe(404)
  })

  it('rejects invalid input', async () => {
    expect((await PATCH(request('PATCH', { ...validPartner, name: '' }), context)).status).toBe(400)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('updates and audits', async () => {
    const response = await PATCH(request('PATCH', validPartner), context)
    expect(response.status).toBe(200)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PARTNER' }))
  })
})

describe('DELETE /api/admin/partners/[id]', () => {
  it('restricts deletion to ADMIN', async () => {
    await DELETE(request('DELETE'), context)
    expect(mocks.guard).toHaveBeenCalledWith(expect.anything(), ['ADMIN'])
  })

  it('propagates the guard response when the caller is not ADMIN', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 403 }) })
    expect((await DELETE(request('DELETE'), context)).status).toBe(403)
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it('returns 404 for a missing partner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await DELETE(request('DELETE'), context)).status).toBe(404)
  })

  it('deletes and audits', async () => {
    const response = await DELETE(request('DELETE'), context)
    expect(response.status).toBe(200)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE', entityType: 'PARTNER' }))
  })
})
