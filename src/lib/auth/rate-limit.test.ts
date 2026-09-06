import { describe, expect, it } from 'vitest'
import { isRateLimitAllowed, isWithinRateLimitCooldown, type RateLimitRule } from './rate-limit'

describe('isRateLimitAllowed', () => {
  const failureRule: RateLimitRule = {
    windowMs: 15 * 60 * 1000,
    limit: 5,
    blockAtLimit: true,
  }

  it('permite quatro falhas e bloqueia a quinta', () => {
    expect(isRateLimitAllowed(4, failureRule)).toBe(true)
    expect(isRateLimitAllowed(5, failureRule)).toBe(false)
  })

  it('permite a primeira solicitação quando o limite é um cooldown de envio', () => {
    const sendCooldownRule: RateLimitRule = {
      windowMs: 60 * 1000,
      limit: 1,
      blockAtLimit: false,
    }

    expect(isRateLimitAllowed(1, sendCooldownRule)).toBe(true)
    expect(isRateLimitAllowed(2, sendCooldownRule)).toBe(false)
  })

  it('mantém o cooldown por 60 segundos completos depois do envio', () => {
    const sentAt = new Date('2026-09-05T00:00:59.900Z')
    const rule: RateLimitRule = { windowMs: 60 * 1000, limit: 1, blockAtLimit: false }

    expect(isWithinRateLimitCooldown(sentAt, rule, new Date('2026-09-05T00:01:00.100Z'))).toBe(true)
    expect(isWithinRateLimitCooldown(sentAt, rule, new Date('2026-09-05T00:01:59.900Z'))).toBe(false)
  })
})
