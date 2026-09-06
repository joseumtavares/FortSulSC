import type { AdminUser } from '@prisma/client'
import { prisma } from '@/lib/db/client'
import { checkAndIncrementRateLimit, isRateLimitBlocked, tryStartRateLimitCooldown } from './rate-limit'
import { RATE_LIMIT_RULES } from './lockout'
import { createPendingLogin, loadActivePendingLogin } from './pending-login'

type PasswordFailureInput = {
  adminUserId?: string
  email: string
  ipHash: string
  deviceId: string
}

type CodeFailureInput = {
  adminUserId: string
  email: string
  ipHash: string
  deviceId: string | null
  result: 'CODE_EXPIRED' | 'CODE_INVALID'
}

export async function findActiveAdminByEmail(email: string): Promise<AdminUser | null> {
  return prisma.adminUser.findUnique({ where: { email } })
}

export async function isPasswordStepBlocked(input: {
  email: string
  ipHash: string
  deviceId: string
}): Promise<boolean> {
  const rule = RATE_LIMIT_RULES.PASSWORD_STEP
  const checks = await Promise.all([
    isRateLimitBlocked(prisma, { dimension: 'EMAIL', key: input.email, context: 'PASSWORD_STEP', rule }),
    isRateLimitBlocked(prisma, { dimension: 'IP', key: input.ipHash, context: 'PASSWORD_STEP', rule }),
    isRateLimitBlocked(prisma, { dimension: 'DEVICE', key: input.deviceId, context: 'PASSWORD_STEP', rule }),
  ])
  return checks.some(Boolean)
}

export async function registerPasswordFailure(input: PasswordFailureInput): Promise<boolean> {
  const rule = RATE_LIMIT_RULES.PASSWORD_STEP
  const [emailLimit, ipLimit, deviceLimit] = await Promise.all([
    checkAndIncrementRateLimit(prisma, { dimension: 'EMAIL', key: input.email, context: 'PASSWORD_STEP', rule }),
    checkAndIncrementRateLimit(prisma, { dimension: 'IP', key: input.ipHash, context: 'PASSWORD_STEP', rule }),
    checkAndIncrementRateLimit(prisma, { dimension: 'DEVICE', key: input.deviceId, context: 'PASSWORD_STEP', rule }),
  ])
  const blocked = !emailLimit.allowed || !ipLimit.allowed || !deviceLimit.allowed

  await prisma.loginAttempt.create({
    data: {
      adminUserId: input.adminUserId,
      email: input.email,
      ipHash: input.ipHash,
      deviceId: input.deviceId,
      result: blocked ? 'BLOCKED' : 'PASSWORD_INVALID',
      blockedUntil: blocked ? new Date(Date.now() + rule.windowMs) : null,
    },
  })

  return blocked
}

export function startCodeSendCooldown(email: string): Promise<boolean> {
  return tryStartRateLimitCooldown(prisma, {
    dimension: 'EMAIL',
    key: email,
    context: 'CODE_SEND',
    rule: RATE_LIMIT_RULES.CODE_SEND,
  })
}

export function createAdminPendingLogin(adminUserId: string) {
  return createPendingLogin(prisma, adminUserId)
}

export function createAdminLoginCode(data: {
  adminUserId: string
  codeHash: string
  expiresAt: Date
}) {
  return prisma.adminLoginCode.create({ data })
}

export async function isCodeStepBlocked(input: {
  email: string
  ipHash: string
  deviceId: string | null
}): Promise<boolean> {
  const rule = RATE_LIMIT_RULES.CODE_STEP
  const checks = await Promise.all([
    isRateLimitBlocked(prisma, { dimension: 'EMAIL', key: input.email, context: 'CODE_STEP', rule }),
    isRateLimitBlocked(prisma, { dimension: 'IP', key: input.ipHash, context: 'CODE_STEP', rule }),
    ...(input.deviceId
      ? [isRateLimitBlocked(prisma, { dimension: 'DEVICE', key: input.deviceId, context: 'CODE_STEP', rule })]
      : []),
  ])
  return checks.some(Boolean)
}

export async function findLatestActiveLoginCode(adminUserId: string) {
  return prisma.adminLoginCode.findFirst({
    where: { adminUserId, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  })
}

export async function registerCodeFailure(input: CodeFailureInput): Promise<boolean> {
  const rule = RATE_LIMIT_RULES.CODE_STEP
  const checks = await Promise.all([
    checkAndIncrementRateLimit(prisma, { dimension: 'EMAIL', key: input.email, context: 'CODE_STEP', rule }),
    checkAndIncrementRateLimit(prisma, { dimension: 'IP', key: input.ipHash, context: 'CODE_STEP', rule }),
    ...(input.deviceId
      ? [checkAndIncrementRateLimit(prisma, { dimension: 'DEVICE', key: input.deviceId, context: 'CODE_STEP', rule })]
      : []),
  ])
  const blocked = checks.some((check) => !check.allowed)

  await prisma.loginAttempt.create({
    data: {
      adminUserId: input.adminUserId,
      email: input.email,
      ipHash: input.ipHash,
      deviceId: input.deviceId,
      result: blocked ? 'BLOCKED' : input.result,
      blockedUntil: blocked ? new Date(Date.now() + rule.windowMs) : null,
    },
  })

  return blocked
}

export function loadAdminPendingLogin(pendingLoginId: string) {
  return loadActivePendingLogin(prisma, pendingLoginId)
}

export function recordSuccessfulLogin(data: {
  adminUserId: string
  email: string
  ipHash: string
  deviceId: string | null
}) {
  return prisma.loginAttempt.create({ data: { ...data, result: 'SUCCESS' } })
}
