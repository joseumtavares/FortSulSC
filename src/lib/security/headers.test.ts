import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy, securityHeaders } from './headers'

describe('securityHeaders', () => {
  it('declara os cabeçalhos estáticos mínimos para respostas HTTP do aplicativo', () => {
    const headers: Array<{ key: string; value: string }> = securityHeaders(false)

    expect(headers).toContainEqual({ key: 'X-Content-Type-Options', value: 'nosniff' })
    expect(headers).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' })
    expect(headers).toContainEqual({ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' })
    expect(headers).toContainEqual({ key: 'Permissions-Policy', value: 'camera=(), geolocation=(self), microphone=()' })
  })

  it('não inclui Content-Security-Policy (precisa de nonce por requisição, montada no middleware)', () => {
    expect(securityHeaders(false).find((header) => header.key === 'Content-Security-Policy')).toBeUndefined()
  })

  it('inclui HSTS somente em produção', () => {
    expect(securityHeaders(false)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'Strict-Transport-Security' }),
    ]))
    expect(securityHeaders(true)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'Strict-Transport-Security' }),
    ]))
  })
})

describe('buildContentSecurityPolicy', () => {
  it('inclui o nonce e strict-dynamic em script-src, sem unsafe-inline', () => {
    const csp = buildContentSecurityPolicy('abc123', false, [])
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'")
  })

  it('mantém unsafe-inline em style-src de propósito (nonce não cobre o atributo HTML style=)', () => {
    const csp = buildContentSecurityPolicy('abc123', false, [])
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
  })

  it('permite unsafe-eval somente no servidor de desenvolvimento', () => {
    const developmentCsp = buildContentSecurityPolicy('abc123', true, [])
    const productionCsp = buildContentSecurityPolicy('abc123', false, [])

    expect(developmentCsp).toContain("'unsafe-eval'")
    expect(productionCsp).not.toContain("'unsafe-eval'")
  })

  it('sem provedor de storage configurado, img-src permanece restrito a self/data/blob/ladrilhos do mapa', () => {
    const csp = buildContentSecurityPolicy('abc123', false, [])
    expect(csp).toContain("img-src 'self' data: blob: https://*.tile.openstreetmap.org;")
  })

  it('inclui a origem do storage de imagens configurado em img-src', () => {
    const csp = buildContentSecurityPolicy('abc123', false, ['https://qhttphrfozrwgurnlmni.supabase.co'])
    expect(csp).toContain("img-src 'self' data: blob: https://*.tile.openstreetmap.org https://qhttphrfozrwgurnlmni.supabase.co;")
  })

  it('ignora origens nulas/indefinidas sem quebrar a política', () => {
    const csp = buildContentSecurityPolicy('abc123', false, [null, undefined])
    expect(csp).toContain("img-src 'self' data: blob: https://*.tile.openstreetmap.org;")
  })

  it('sempre libera os ladrilhos do mapa de representantes em img-src, mesmo sem storage configurado', () => {
    expect(buildContentSecurityPolicy('abc123')).toContain('https://*.tile.openstreetmap.org')
  })

  it('usa um nonce diferente a cada chamada quando gerado por chamador (não fixa o valor)', () => {
    expect(buildContentSecurityPolicy('nonce-one')).toContain('nonce-one')
    expect(buildContentSecurityPolicy('nonce-two')).toContain('nonce-two')
  })
})
