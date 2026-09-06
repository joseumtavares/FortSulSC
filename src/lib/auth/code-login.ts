import { hashIp } from './crypto'
import type { NextRequest } from 'next/server'
import { requireMfaCodePepper } from './env'
import { findLatestActiveLoginCode, isCodeStepBlocked, loadAdminPendingLogin, recordSuccessfulLogin, registerCodeFailure } from './admin-login-repository'
import { isValidDeviceId } from './device'
import { verifyLoginCodeHash } from './login-code'
import { clientIp } from './request-ip'
import { signIn } from './config'

export type CodeLoginResult =
  | { kind: 'expired' | 'invalid' | 'blocked' | 'session_expired' }
  | { kind: 'authenticated' }

export async function processCodeLogin(input: {
  code: string
  pendingLoginId: string
  request: NextRequest
}): Promise<CodeLoginResult> {
  const pending = await loadAdminPendingLogin(input.pendingLoginId)
  if (!pending || !pending.adminUser.active) return { kind: 'session_expired' }

  const pepper = requireMfaCodePepper()
  const ipHash = hashIp(clientIp(input.request), pepper)
  const rawDeviceId = input.request.headers.get('cookie')?.match(/(?:^|;\s*)fs_device_id=([^;]+)/)?.[1]
  const deviceId = isValidDeviceId(rawDeviceId) ? rawDeviceId : null

  if (await isCodeStepBlocked({ email: pending.adminUser.email, ipHash, deviceId })) return { kind: 'blocked' }

  const loginCode = await findLatestActiveLoginCode(pending.adminUserId)
  if (!loginCode || loginCode.expiresAt.getTime() < Date.now()) {
    const blocked = await registerCodeFailure({ adminUserId: pending.adminUserId, email: pending.adminUser.email, ipHash, deviceId, result: 'CODE_EXPIRED' })
    return { kind: blocked ? 'blocked' : 'expired' }
  }

  if (!verifyLoginCodeHash(input.code, pepper, loginCode.codeHash)) {
    const blocked = await registerCodeFailure({ adminUserId: pending.adminUserId, email: pending.adminUser.email, ipHash, deviceId, result: 'CODE_INVALID' })
    return { kind: blocked ? 'blocked' : 'invalid' }
  }

  await signIn('credentials', { pendingLoginId: input.pendingLoginId, code: input.code, redirect: false })
  await recordSuccessfulLogin({ adminUserId: pending.adminUser.id, email: pending.adminUser.email, ipHash, deviceId })
  return { kind: 'authenticated' }
}
