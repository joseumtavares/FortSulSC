import type { AdminRole } from '@prisma/client'

export class ForbiddenRoleError extends Error {}

export function requireRole(role: AdminRole, allowed: AdminRole[]): void {
  if (!allowed.includes(role)) {
    throw new ForbiddenRoleError(`Role ${role} not allowed`)
  }
}
