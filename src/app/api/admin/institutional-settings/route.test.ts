import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ guard: vi.fn(), get: vi.fn(), upsert: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/institutional-settings-repository', () => ({ getInstitutionalSettings: mocks.get, upsertInstitutionalSettings: mocks.upsert }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
import { GET, PUT } from './route'
const valid = { whatsapp: '48999990000', email: 'contato@example.com' }
function request(body: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/institutional-settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.get.mockResolvedValue(null)
  mocks.upsert.mockResolvedValue({ id: 'settings-1' })
})
describe('institutional settings', () => {
  it('returns null before first configuration', async () => {
    expect(await (await GET(request(null))).json()).toBeNull()
  })
  it.each([{ ...valid, email: 'invalid' }, { ...valid, whatsapp: '' }, { ...valid, socialLinks: { other: 'https://example.com' } }, { ...valid, socialLinks: { instagram: 'http://instagram.com' } }, { ...valid, phone: 123 }])('rejects invalid settings: %j', async (body) => {
    expect((await PUT(request(body))).status).toBe(400)
    expect(mocks.upsert).not.toHaveBeenCalled()
  })
  it('upserts the same configuration and audits its id', async () => {
    for (let i = 0; i < 2; i++) expect((await PUT(request(valid))).status).toBe(200)
    expect(mocks.upsert).toHaveBeenCalledTimes(2)
    expect(mocks.audit).toHaveBeenCalledWith({ adminUserId: 'admin-1', action: 'UPDATE', entityType: 'INSTITUTIONAL_SETTINGS', entityId: 'settings-1', result: 'SUCCESS' })
  })
  it('restricts editing to ADMIN', async () => {
    await PUT(request(valid))
    expect(mocks.guard).toHaveBeenCalledWith(expect.anything(), ['ADMIN'])
  })
  it('does not allow overwriting singleton identity', async () => {
    await PUT(request({ ...valid, id: 'injected', singletonKey: 2 }))
    expect(mocks.upsert).toHaveBeenCalledWith({ ...valid, phone: null, cnpj: null, address: null, socialLinks: undefined })
  })
  it('denies both operations when guard fails', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 403 }) })
    expect((await GET(request(null))).status).toBe(403)
    expect((await PUT(request(valid))).status).toBe(403)
    expect(mocks.get).not.toHaveBeenCalled()
    expect(mocks.upsert).not.toHaveBeenCalled()
  })
})
