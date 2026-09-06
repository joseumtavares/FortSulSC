import { randomUUID } from 'node:crypto'

// Cookie de correlação opaco — não é fingerprint (não deriva de user-agent,
// resolução de tela ou qualquer característica do navegador), só um token
// aleatório para o rate limiting multi-dimensão (ver proposta §3.1).
export const DEVICE_COOKIE_NAME = 'fs_device_id'
export const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createDeviceId(): string {
  return randomUUID()
}

export function isValidDeviceId(value: string | undefined | null): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}
