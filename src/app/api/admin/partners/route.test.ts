// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), list: vi.fn(), create: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/partner-repository', () => ({ listPartnersForAdmin: mocks.list, createPartner: mocks.create }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.list.mockResolvedValue([])
  mocks.create.mockResolvedValue({ id: 'p1' })
})

function request(method: string, options: { body?: unknown; search?: string } = {}) {
  const url = `http://localhost:3000/api/admin/partners${options.search ?? ''}`
  return new NextRequest(url, {
    method,
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: options.body ? { 'content-type': 'application/json' } : undefined,
  })
}

const validPartner = { type: 'REPRESENTATIVE', name: 'Fulano de Tal', whatsapp: '5548999990000' }

import { GET, POST } from './route'

describe('GET /api/admin/partners', () => {
  it('denies unauthenticated reads', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await GET(request('GET'))).status).toBe(401)
  })

  it('lists without a type filter by default', async () => {
    await GET(request('GET'))
    expect(mocks.list).toHaveBeenCalledWith(undefined)
  })

  it('filters by type from the query string', async () => {
    await GET(request('GET', { search: '?type=reseller' }))
    expect(mocks.list).toHaveBeenCalledWith('RESELLER')
  })

  it('ignores an invalid type filter', async () => {
    await GET(request('GET', { search: '?type=owner' }))
    expect(mocks.list).toHaveBeenCalledWith(undefined)
  })
})

describe('POST /api/admin/partners', () => {
  it('rejects invalid input', async () => {
    const response = await POST(request('POST', { body: { name: '' } }))
    expect(response.status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('creates and audits', async () => {
    const response = await POST(request('POST', { body: validPartner }))
    expect(response.status).toBe(201)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE', entityType: 'PARTNER', entityId: 'p1' }))
  })

  it('resolves a pasted location link into rounded coordinates before creating', async () => {
    const body = { ...validPartner, locationLink: 'https://www.google.com/maps/place/Foo/@-27.595378,-48.548123,15z' }
    const response = await POST(request('POST', { body }))
    expect(response.status).toBe(201)
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ approximateLat: -27.6, approximateLng: -48.55 }))
  })

  it('rejects a location link from an untrusted host', async () => {
    const body = { ...validPartner, locationLink: 'https://evil.example.com/@-27.5,-48.5' }
    const response = await POST(request('POST', { body }))
    expect(response.status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })
})
