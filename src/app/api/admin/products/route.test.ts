// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), list: vi.fn(), create: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ listProductsForAdmin: mocks.list, createProduct: mocks.create }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.create.mockResolvedValue({ id: 'p1' })
})

function request(method: string, body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/products', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { GET, POST } from './route'

describe('GET /api/admin/products', () => {
  it('denies unauthenticated reads', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await GET(request('GET'))).status).toBe(401)
  })

  it('lists products', async () => {
    mocks.list.mockResolvedValue([{ id: 'p1' }])
    const response = await GET(request('GET'))
    expect(response.status).toBe(200)
    expect(await response.json()).toHaveLength(1)
  })
})

describe('POST /api/admin/products', () => {
  it('denies unauthenticated writes', async () => {
    mocks.guard.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) })
    expect((await POST(request('POST', { code: 'ALM-1', name: 'Alimentador' }))).status).toBe(401)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('rejects invalid input', async () => {
    expect((await POST(request('POST', { code: '', name: '' }))).status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('creates and audits', async () => {
    const response = await POST(request('POST', { code: 'ALM-1', name: 'Alimentador' }))
    expect(response.status).toBe(201)
    expect(mocks.create).toHaveBeenCalled()
    expect(mocks.audit).toHaveBeenCalledWith({ adminUserId: 'admin-1', action: 'CREATE', entityType: 'PRODUCT', entityId: 'p1', result: 'SUCCESS' })
  })
})
