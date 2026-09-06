import { createHmac } from 'node:crypto'
import bcrypt from 'bcryptjs'

export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_MAX_LENGTH = 128
export const BCRYPT_COST = 12

export class InvalidPasswordLengthError extends Error {
  constructor() {
    super(`A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres.`)
    this.name = 'InvalidPasswordLengthError'
  }
}

function isValidPasswordLength(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH
}

export async function hashPassword(password: string): Promise<string> {
  if (!isValidPasswordLength(password)) {
    throw new InvalidPasswordLengthError()
  }
  return bcrypt.hash(password, BCRYPT_COST)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!isValidPasswordLength(password)) {
    return false
  }
  return bcrypt.compare(password, hash)
}

export function hashIp(ip: string, pepper: string): string {
  return createHmac('sha256', pepper).update(`ip:${ip}`).digest('hex')
}
