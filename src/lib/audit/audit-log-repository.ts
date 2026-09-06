import type { AuditAction, AuditEntityType, AuditResult } from '@prisma/client'
import { prisma } from '@/lib/db/client'

export type AuditEventInput = {
  adminUserId: string | null
  action: AuditAction
  entityType: AuditEntityType
  entityId: string | null
  result: AuditResult
}

export function recordAuditEvent(input: AuditEventInput) {
  return prisma.auditLog.create({ data: input })
}
