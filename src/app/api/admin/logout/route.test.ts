import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { isSameOriginRequest, signOut } = vi.hoisted(() => ({
  isSameOriginRequest: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/auth/origin-check', () => ({ isSameOriginRequest }))
vi.mock('@/lib/auth/config', () => ({ signOut }))

import { POST } from './route'

describe('POST /api/admin/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita uma requisição sem origem antes de encerrar a sessão', async () => {
    isSameOriginRequest.mockReturnValue(false)

    const response = await POST(new NextRequest('http://localhost:3000/api/admin/logout', { method: 'POST' }))

    expect(response.status).toBe(403)
    expect(signOut).not.toHaveBeenCalled()
  })

  it('encerra a sessão quando a origem é válida', async () => {
    isSameOriginRequest.mockReturnValue(true)
    signOut.mockResolvedValue(undefined)

    const response = await POST(new NextRequest('http://localhost:3000/api/admin/logout', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    }))

    expect(response.status).toBe(200)
    expect(signOut).toHaveBeenCalledWith({ redirect: false })
  })
})
