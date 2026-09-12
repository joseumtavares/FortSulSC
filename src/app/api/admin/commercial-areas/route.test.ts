// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), list: vi.fn(), create: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/commercial-area-repository', () => ({ listCommercialAreasForAdmin: mocks.list, createCommercialArea: mocks.create }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.list.mockResolvedValue([])
  mocks.create.mockResolvedValue({ id: 'a1' })
})

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/commercial-areas', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { GET, POST } from './route'

describe('GET /api/admin/commercial-areas', () => {
  it('denies unauthenticated reads', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await GET(request('GET'))).status).toBe(401)
  })

  it('lists commercial areas', async () => {
    mocks.list.mockResolvedValue([{ id: 'a1', name: 'Grande Florianópolis' }])
    const response = await GET(request('GET'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([{ id: 'a1', name: 'Grande Florianópolis' }])
  })
})

describe('POST /api/admin/commercial-areas', () => {
  it('rejects invalid input', async () => {
    const response = await POST(request('POST', { name: '' }))
    expect(response.status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('creates and audits', async () => {
    const response = await POST(request('POST', { name: 'Grande Florianópolis' }))
    expect(response.status).toBe(201)
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE', entityType: 'COMMERCIAL_AREA', entityId: 'a1' }))
  })
})
