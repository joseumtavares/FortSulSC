// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), create: vi.fn(), audit: vi.fn(), upload: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ findProductForAdmin: mocks.find }))
vi.mock('@/lib/content/product-image-repository', () => ({ createProductImage: mocks.create }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/storage/image-storage', () => ({ getImageStorage: () => ({ upload: mocks.upload }) }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
  mocks.upload.mockResolvedValue({ url: 'https://example.com/new.webp' })
  mocks.create.mockResolvedValue({ id: 'img-1', imageUrl: 'https://example.com/new.webp', altText: 'Alt', role: 'GALLERY' })
})

function uploadForm({ type = 'image/webp', size = 5, alt = 'Imagem', role }: { type?: string; size?: number; alt?: string; role?: string } = {}) {
  const form = new FormData()
  form.set('file', new File([new Uint8Array(size)], 'produto.webp', { type }))
  form.set('alt', alt)
  if (role) form.set('role', role)
  return form
}

function request(body?: BodyInit) {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/images', { method: 'POST', body })
}

import { POST } from './route'

describe('POST /api/admin/products/[id]/images', () => {
  it('denies unauthenticated writes', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await POST(request(uploadForm()), context)).status).toBe(401)
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await POST(request(uploadForm()), context)).status).toBe(404)
  })

  it.each([['image/svg+xml', 5], ['image/webp', 0], ['image/webp', 5 * 1024 * 1024 + 1]])('rejects unsupported or empty/oversized files', async (type, size) => {
    expect((await POST(request(uploadForm({ type: type as string, size: size as number })), context)).status).toBe(400)
    expect(mocks.upload).not.toHaveBeenCalled()
  })

  it('requires alt text', async () => {
    expect((await POST(request(uploadForm({ alt: '' })), context)).status).toBe(400)
  })

  it('defaults role to GALLERY when omitted', async () => {
    await POST(request(uploadForm()), context)
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'GALLERY' }))
  })

  it('accepts role HERO explicitly', async () => {
    await POST(request(uploadForm({ role: 'HERO' })), context)
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'HERO' }))
  })

  it('uploads, persists, audits and revalidates', async () => {
    const response = await POST(request(uploadForm()), context)
    expect(response.status).toBe(201)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT', entityId: id }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
