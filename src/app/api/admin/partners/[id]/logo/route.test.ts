// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), updateLogo: vi.fn(), audit: vi.fn(), upload: vi.fn(), remove: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/partner-repository', () => ({ findPartnerForAdmin: mocks.find, updatePartnerLogo: mocks.updateLogo }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/storage/image-storage', () => ({ getImageStorage: () => ({ upload: mocks.upload, delete: mocks.remove }) }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

function fileBytes(type: string, size: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(size))
  if (type === 'image/webp' && size >= 12) bytes.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
  else if (type === 'image/jpeg' && size >= 3) bytes.set([0xff, 0xd8, 0xff])
  return bytes
}

function uploadForm(type = 'image/webp', size = 16) {
  const form = new FormData()
  form.set('file', new File([fileBytes(type, size)], 'logo.webp', { type }))
  return form
}

function request(body?: BodyInit) {
  return new NextRequest('http://localhost:3000/api/admin/partners/p1/logo', { method: 'POST', body })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id, logoKey: null })
  mocks.upload.mockResolvedValue({ url: 'https://example.com/logo.webp' })
  mocks.updateLogo.mockResolvedValue({ id })
  mocks.remove.mockResolvedValue(undefined)
})

import { POST } from './route'

describe('POST /api/admin/partners/[id]/logo', () => {
  it('returns 404 for a missing partner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request(uploadForm()), context)).status).toBe(404)
  })

  it.each([['image/svg+xml', 16], ['image/webp', 0], ['image/webp', 5 * 1024 * 1024 + 1]])('rejects unsupported or empty/oversized files', async (type, size) => {
    expect((await POST(request(uploadForm(type as string, size as number)), context)).status).toBe(400)
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('rejects a file whose content does not match the declared type', async () => {
    const form = new FormData()
    form.set('file', new File([new Uint8Array(16)], 'logo.webp', { type: 'image/webp' }))
    expect((await POST(request(form), context)).status).toBe(400)
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('uploads, updates the partner, audits and does not delete anything when there was no previous logo', async () => {
    const response = await POST(request(uploadForm()), context)
    expect(response.status).toBe(200)
    expect(mocks.updateLogo).toHaveBeenCalledWith(id, 'https://example.com/logo.webp', expect.stringContaining(`partners/${id}/`))
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PARTNER' }))
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it('deletes the previous logo after a successful replace', async () => {
    mocks.find.mockResolvedValue({ id, logoKey: 'partners/p1/old.webp' })
    const response = await POST(request(uploadForm()), context)
    expect(response.status).toBe(200)
    expect(mocks.remove).toHaveBeenCalledWith('partners/p1/old.webp')
  })
})
