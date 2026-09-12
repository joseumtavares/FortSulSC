// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), upsertPrivate: vi.fn(), audit: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/partner-repository', () => ({ findPartnerForAdmin: mocks.find, upsertPartnerPrivate: mocks.upsertPrivate }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
})

function request(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/partners/p1/private', {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { PUT } from './route'
import { PARTNER_DOCUMENT_SIGNED_TEXT, PARTNER_LGPD_AUTHORIZATION_TEXT } from '@/lib/content/partner-private-input'

describe('PUT /api/admin/partners/[id]/private', () => {
  it('returns 404 for a missing partner', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PUT(request({ documentSigned: true }), context)).status).toBe(404)
  })

  it('rejects a non-object body', async () => {
    expect((await PUT(request(null), context)).status).toBe(400)
    expect(mocks.upsertPrivate).not.toHaveBeenCalled()
  })

  it('saves private data and audits', async () => {
    const response = await PUT(request({ documentSigned: true, lgpdAuthorized: true }), context)
    expect(response.status).toBe(200)
    expect(mocks.upsertPrivate).toHaveBeenCalledWith(id, {
      document: PARTNER_DOCUMENT_SIGNED_TEXT,
      consentNotes: PARTNER_LGPD_AUTHORIZATION_TEXT,
    })
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PARTNER' }))
  })

  it('unchecked boxes clear the stored values', async () => {
    const response = await PUT(request({ documentSigned: false, lgpdAuthorized: false }), context)
    expect(response.status).toBe(200)
    expect(mocks.upsertPrivate).toHaveBeenCalledWith(id, { document: null, consentNotes: null })
  })
})
