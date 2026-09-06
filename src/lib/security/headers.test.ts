import { describe, expect, it } from 'vitest'
import { securityHeaders } from './headers'

describe('securityHeaders', () => {
  it('declara os cabeçalhos mínimos para respostas HTTP do aplicativo', () => {
    const headers: Array<{ key: string; value: string }> = securityHeaders(false)

    expect(headers.find((header) => header.key === 'Content-Security-Policy')?.value).toContain("default-src 'self'")
    expect(headers).toContainEqual({ key: 'X-Content-Type-Options', value: 'nosniff' })
    expect(headers).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' })
    expect(headers).toContainEqual({ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' })
    expect(headers).toContainEqual({ key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' })
  })

  it('inclui HSTS somente em produção', () => {
    expect(securityHeaders(false)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'Strict-Transport-Security' }),
    ]))
    expect(securityHeaders(true)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'Strict-Transport-Security' }),
    ]))
  })

  it('permite unsafe-eval somente no servidor de desenvolvimento', () => {
    const developmentCsp = securityHeaders(false, true).find(
      (header) => header.key === 'Content-Security-Policy',
    )?.value
    const productionCsp = securityHeaders(false, false).find(
      (header) => header.key === 'Content-Security-Policy',
    )?.value

    expect(developmentCsp).toContain("'unsafe-eval'")
    expect(productionCsp).not.toContain("'unsafe-eval'")
  })
})
