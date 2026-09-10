// @vitest-environment node
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
function uploadForm(type = 'image/webp', size = 5) {
  const form = new FormData()
  
  form.set('file', new File([new Uint8Array(size)], 'banner.webp', { type }))
  return form
}
describe('banner upload', () => {
  it('denies requests without permission', async () => {
    const form = uploadForm()
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await POST(request('POST', form), context)).status).toBe(401)
    expect(mocks.upload).not.toHaveBeenCalled()
  })
  it.each([['image/svg+xml', 5], ['image/webp', 0], ['image/webp', 5 * 1024 * 1024 + 1]])('rejects unsupported or empty/oversized files', async (type, size) => {
    const form = uploadForm(type as string, size as number)
    expect((await POST(request('POST', form), context)).status).toBe(400)
    expect(mocks.upload).not.toHaveBeenCalled()
  })
  it('uploads, persists and audits', async () => {
    const form = uploadForm()
    expect((await POST(request('POST', form), context)).status).toBe(200)
    expect(mocks.update).toHaveBeenCalled()
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'BANNER', entityId: id }))
    expect(mocks.remove).toHaveBeenCalledWith('banners/old.webp')
  })
  it('cleans up the new upload when persistence fails', async () => {
    const form = uploadForm()
    mocks.update.mockRejectedValue(new Error('private db detail'))
    const response = await POST(request('POST', form), context)
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('private db detail')
    expect(mocks.remove).toHaveBeenCalledWith(mocks.upload.mock.calls[0]?.[0].key)
    expect(mocks.remove).not.toHaveBeenCalledWith('banners/old.webp')
    expect(mocks.audit).not.toHaveBeenCalled()
  })
})
