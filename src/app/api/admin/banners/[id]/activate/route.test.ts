import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ guard: vi.fn(), list: vi.fn(), create: vi.fn(), find: vi.fn(), update: vi.fn(), audit: vi.fn(), upload: vi.fn(), remove: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/banner-repository', () => ({ listBannersForAdmin: mocks.list, createBanner: mocks.create, findBannerForAdmin: mocks.find, updateBanner: mocks.update }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/storage/image-storage', () => ({ getImageStorage: () => ({ upload: mocks.upload, delete: mocks.remove }) }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
const id = '12345678-1234-1234-1234-123456789abc'
const context = { params: Promise.resolve({ id }) }
beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id, imageKey: 'banners/old.webp' })
  mocks.create.mockResolvedValue({ id, active: false })
  mocks.update.mockResolvedValue({ id })
  mocks.upload.mockResolvedValue({ url: 'https://example.com/new.webp' })
})
function request(method: string, body?: BodyInit, json = false) {
  return new NextRequest('http://localhost:3000/api/admin/banners', { method, body, headers: json ? { 'content-type': 'application/json' } : undefined })
}
import { POST } from './route'
describe('activate', () => {
  it('denies unauthenticated writes', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await POST(request('POST'), context)).status).toBe(401)
    expect(mocks.update).not.toHaveBeenCalled()
  })
  it('returns 404 for a missing banner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request('POST'), context)).status).toBe(404)
  })
  it('changes only active and audits the correct action', async () => {
    expect((await POST(request('POST'), context)).status).toBe(200)
    expect(mocks.update).toHaveBeenCalledWith(id, { active: true })
    expect(mocks.audit).toHaveBeenCalledWith({ adminUserId: 'admin-1', action: 'ACTIVATE', entityType: 'BANNER', entityId: id, result: 'SUCCESS' })
  })
})
