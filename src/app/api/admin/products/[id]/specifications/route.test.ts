// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH, MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH } from '@/lib/content/text-limits'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), find: vi.fn(), setSpecifications: vi.fn(), audit: vi.fn(), revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/admin-route-guard', () => ({ requireAdminRequest: mocks.guard }))
vi.mock('@/lib/content/product-repository', () => ({ findProductForAdmin: mocks.find, setProductSpecifications: mocks.setSpecifications }))
vi.mock('@/lib/audit/audit-log-repository', () => ({ recordAuditEvent: mocks.audit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

const id = 'p1'
const context = { params: Promise.resolve({ id }) }

beforeEach(() => {
  vi.resetAllMocks()
  mocks.guard.mockResolvedValue({ ok: true, session: { user: { id: 'admin-1' } } })
  mocks.find.mockResolvedValue({ id })
})

function request(body?: unknown) {
  return new NextRequest('http://localhost:3000/api/admin/products/p1/specifications', {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
  })
}

import { PUT } from './route'

describe('PUT /api/admin/products/[id]/specifications', () => {
  it('returns 404 for a missing product', async () => {
    mocks.find.mockResolvedValue(null)
    expect((await PUT(request({ specifications: [] }), context)).status).toBe(404)
  })

  it('rejects a specification missing label or value', async () => {
    expect((await PUT(request({ specifications: [{ label: 'Potência', value: '' }] }), context)).status).toBe(400)
    expect(mocks.setSpecifications).not.toHaveBeenCalled()
  })

  it('rejects a specification label or value longer than the character limit', async () => {
    const longLabel = { label: 'A'.repeat(MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH + 1), value: '5 HP' }
    expect((await PUT(request({ specifications: [longLabel] }), context)).status).toBe(400)

    const longValue = { label: 'Potência', value: 'A'.repeat(MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH + 1) }
    expect((await PUT(request({ specifications: [longValue] }), context)).status).toBe(400)
    expect(mocks.setSpecifications).not.toHaveBeenCalled()
  })

  it('replaces specifications with sequential order, audits and revalidates', async () => {
    const response = await PUT(request({ specifications: [{ label: 'Potência', value: '5 HP' }] }), context)
    expect(response.status).toBe(200)
    expect(mocks.setSpecifications).toHaveBeenCalledWith(id, [{ label: 'Potência', value: '5 HP', order: 0 }])
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'PRODUCT' }))
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')
  })
})
