import { afterEach, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { clientIp } from './request-ip'

const originalTrustProxyHeaders = process.env.TRUST_PROXY_HEADERS

afterEach(() => {
  if (originalTrustProxyHeaders === undefined) {
    delete process.env.TRUST_PROXY_HEADERS
  } else {
    process.env.TRUST_PROXY_HEADERS = originalTrustProxyHeaders
  }
})

describe('clientIp', () => {
  it('ignora cabeçalhos de IP forjáveis quando não há proxy confiável configurado', () => {
    process.env.TRUST_PROXY_HEADERS = 'false'
    const request = new NextRequest('http://localhost:3000', {
      headers: { 'x-forwarded-for': '203.0.113.10', 'x-real-ip': '203.0.113.11' },
    })

    expect(clientIp(request)).toBe('0.0.0.0')
  })

  it('usa o primeiro IP encaminhado somente quando o proxy confiável foi declarado', () => {
    process.env.TRUST_PROXY_HEADERS = 'true'
    const request = new NextRequest('http://localhost:3000', {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.5' },
    })

    expect(clientIp(request)).toBe('203.0.113.10')
  })
})
