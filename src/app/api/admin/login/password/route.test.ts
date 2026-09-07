import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { AUTH_SERVICE_UNAVAILABLE_CODE } from '@/lib/auth/public-error'

const { isSameOriginRequest, processPasswordLogin, logger } = vi.hoisted(() => ({
  isSameOriginRequest: vi.fn(),
  processPasswordLogin: vi.fn(),
  logger: { error: vi.fn() },
}))

vi.mock('@/lib/auth/origin-check', () => ({ isSameOriginRequest }))
vi.mock('@/lib/auth/password-login', () => ({ processPasswordLogin }))
vi.mock('@/lib/logger', () => ({ logger }))

import { POST } from './route'

describe('POST /api/admin/login/password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isSameOriginRequest.mockReturnValue(true)
  })

  it('retorna um código público de indisponibilidade sem expor a falha interna', async () => {
    processPasswordLogin.mockRejectedValue(new Error('configuração interna'))
    const request = new NextRequest('http://localhost:3000/api/admin/login/password', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fortsul.test', password: 'senha-de-teste' }),
    })

    const response = await POST(request)

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'Não foi possível iniciar o login. Tente novamente em instantes.',
      code: AUTH_SERVICE_UNAVAILABLE_CODE,
    })
    expect(logger.error).toHaveBeenCalledWith('auth.password_login_unavailable', { reason: 'unknown' })
  })
})
