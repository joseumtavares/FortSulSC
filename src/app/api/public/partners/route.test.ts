// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({ list: vi.fn(), rateLimit: vi.fn() }))
vi.mock('@/lib/content/partner-public-repository', () => ({ listPublicPartners: mocks.list, checkPublicPartnersRateLimit: mocks.rateLimit }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

function request(headers?: Record<string, string>) {
  return new NextRequest('http://localhost:3000/api/public/partners', { headers })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.rateLimit.mockResolvedValue({ allowed: true, count: 1, windowStart: new Date(), retryAfterMs: 0 })
  mocks.list.mockResolvedValue([])
})

import { GET } from './route'

describe('GET /api/public/partners', () => {
  it('returns the public partner list', async () => {
    mocks.list.mockResolvedValue([{ id: 'p1', name: 'Fulano' }])
    const response = await GET(request())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([{ id: 'p1', name: 'Fulano' }])
  })

  it('rate limits by IP before querying the database', async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false, count: 31, windowStart: new Date(), retryAfterMs: 5000 })
    const response = await GET(request())
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('5')
    expect(mocks.list).not.toHaveBeenCalled()
  })

  it('returns 500 without leaking internals when the repository throws', async () => {
    mocks.list.mockRejectedValue(new Error('boom'))
    const response = await GET(request())
    expect(response.status).toBe(500)
    expect((await response.json()).error).not.toMatch(/boom/)
  })
})
