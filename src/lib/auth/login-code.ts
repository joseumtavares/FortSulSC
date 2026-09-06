import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

export const LOGIN_CODE_LENGTH = 6
export const LOGIN_CODE_TTL_MS = 10 * 60 * 1000

export function generateLoginCode(): string {
  return randomInt(0, 10 ** LOGIN_CODE_LENGTH).toString().padStart(LOGIN_CODE_LENGTH, '0')
}

export function hashLoginCode(code: string, pepper: string): string {
  return createHmac('sha256', pepper).update(`login-code:${code}`).digest('hex')
}

export function verifyLoginCodeHash(code: string, pepper: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashLoginCode(code, pepper), 'hex')
  let expected: Buffer
  try {
    expected = Buffer.from(expectedHash, 'hex')
  } catch {
    return false
  }
  if (actual.length !== expected.length) {
    return false
  }
  return timingSafeEqual(actual, expected)
}
