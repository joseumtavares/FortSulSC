import { hashIp, verifyPassword } from './crypto'
import type { NextRequest } from 'next/server'
import { requireMfaCodePepper, requireSecureAuthCookies } from './env'
import {
  createAdminLoginCode,
  createAdminPendingLogin,
  findActiveAdminByEmail,
  isPasswordStepBlocked,
  registerPasswordFailure,
  startCodeSendCooldown,
} from './admin-login-repository'
import { createDeviceId, isValidDeviceId } from './device'
import { LOGIN_CODE_TTL_MS, generateLoginCode, hashLoginCode } from './login-code'
import { getEmailSender } from './email'
import { clientIp } from './request-ip'

export type PasswordLoginResult =
  | { kind: 'blocked' | 'invalid' | 'cooldown'; deviceId: string }
  | { kind: 'sent'; deviceId: string; pendingLoginId: string; secureCookies: boolean }

export async function processPasswordLogin(input: {
  email: string
  password: string
  request: NextRequest
}): Promise<PasswordLoginResult> {
  const pepper = requireMfaCodePepper()
  const secureCookies = requireSecureAuthCookies()
  const ipHash = hashIp(clientIp(input.request), pepper)
  const rawDeviceId = input.request.headers.get('cookie')?.match(/(?:^|;\s*)fs_device_id=([^;]+)/)?.[1]
  const deviceId = isValidDeviceId(rawDeviceId) ? rawDeviceId : createDeviceId()

  if (await isPasswordStepBlocked({ email: input.email, ipHash, deviceId })) return { kind: 'blocked', deviceId }

  const admin = await findActiveAdminByEmail(input.email)
  if (!admin || !admin.active) {
    const blocked = await registerPasswordFailure({ email: input.email, ipHash, deviceId })
    return { kind: blocked ? 'blocked' : 'invalid', deviceId }
  }

  if (!(await verifyPassword(input.password, admin.passwordHash))) {
    const blocked = await registerPasswordFailure({ adminUserId: admin.id, email: input.email, ipHash, deviceId })
    return { kind: blocked ? 'blocked' : 'invalid', deviceId }
  }

  if (!(await startCodeSendCooldown(input.email))) return { kind: 'cooldown', deviceId }

  const pending = await createAdminPendingLogin(admin.id)
  const code = generateLoginCode()
  await createAdminLoginCode({
    adminUserId: admin.id,
    codeHash: hashLoginCode(code, pepper),
    expiresAt: new Date(Date.now() + LOGIN_CODE_TTL_MS),
  })
  await getEmailSender().sendLoginCode({ to: admin.email, name: admin.name, code })

  return { kind: 'sent', deviceId, pendingLoginId: pending.id, secureCookies }
}
