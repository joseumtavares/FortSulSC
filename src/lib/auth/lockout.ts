import type { RateLimitRule } from './rate-limit'

export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000
export const LOCKOUT_THRESHOLD = 5
export const CODE_SEND_COOLDOWN_MS = 60 * 1000

export const RATE_LIMIT_RULES: Record<'PASSWORD_STEP' | 'CODE_STEP' | 'CODE_SEND', RateLimitRule> = {
  PASSWORD_STEP: { windowMs: LOCKOUT_WINDOW_MS, limit: LOCKOUT_THRESHOLD, blockAtLimit: true },
  CODE_STEP: { windowMs: LOCKOUT_WINDOW_MS, limit: LOCKOUT_THRESHOLD, blockAtLimit: true },
  CODE_SEND: { windowMs: CODE_SEND_COOLDOWN_MS, limit: 1, blockAtLimit: false },
}

export interface LockoutDecision {
  blocked: boolean
  blockedUntil: Date | null
}

/**
 * Regra pura de bloqueio (contrato de teste independente do armazenamento):
 * a 5ª falha dentro da janela de 15 minutos bloqueia; a 4ª não bloqueia.
 */
export function evaluateLockout(failuresInWindow: number, now: Date = new Date()): LockoutDecision {
  if (failuresInWindow < LOCKOUT_THRESHOLD) {
    return { blocked: false, blockedUntil: null }
  }
  return { blocked: true, blockedUntil: new Date(now.getTime() + LOCKOUT_WINDOW_MS) }
}
