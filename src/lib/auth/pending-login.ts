import type { PendingLogin, PrismaClient } from '@prisma/client'

export const PENDING_LOGIN_COOKIE_NAME = 'fs_pending_login'
export const PENDING_LOGIN_TTL_MS = 10 * 60 * 1000

export async function createPendingLogin(
  prisma: PrismaClient,
  adminUserId: string,
): Promise<PendingLogin> {
  return prisma.pendingLogin.create({
    data: {
      adminUserId,
      expiresAt: new Date(Date.now() + PENDING_LOGIN_TTL_MS),
    },
  })
}

type PendingLoginWithAdmin = PendingLogin & {
  adminUser: { id: string; email: string; name: string; role: string; active: boolean; tokenVersion: number }
}

export async function loadActivePendingLogin(
  prisma: PrismaClient,
  pendingLoginId: string,
): Promise<PendingLoginWithAdmin | null> {
  const pending = await prisma.pendingLogin.findUnique({
    where: { id: pendingLoginId },
    include: { adminUser: true },
  })

  if (!pending) return null
  if (pending.consumedAt) return null
  if (pending.expiresAt.getTime() < Date.now()) return null

  return pending as PendingLoginWithAdmin
}

/**
 * Consome os dois artefatos de MFA com predicados no banco. O primeiro
 * processo concorrente vence; qualquer repetição recebe `false` e não emite
 * uma segunda sessão para o mesmo código.
 */
export async function consumePendingLoginAndCode(
  prisma: PrismaClient,
  pendingLoginId: string,
  loginCodeId: string,
): Promise<boolean> {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    const code = await tx.adminLoginCode.updateMany({
      where: { id: loginCodeId, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    })
    if (code.count !== 1) return false

    const pending = await tx.pendingLogin.updateMany({
      where: { id: pendingLoginId, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    })
    if (pending.count === 1) return true

    throw new Error('Estado de MFA já consumido.')
  })
}
