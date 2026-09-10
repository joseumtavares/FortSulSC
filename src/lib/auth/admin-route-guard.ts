import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import type { AdminRole } from '@prisma/client'
import { auth } from './config'
import { isSameOriginRequest } from './origin-check'
import { ForbiddenRoleError, requireRole } from '@/lib/rbac/require-role'

export type AdminGuardResult = { ok: true; session: Session } | { ok: false; response: NextResponse }

/**
 * Checagem comum a todo Route Handler administrativo que muta dados: origem
 * válida, sessão autenticada e RBAC. Usada pelas rotas novas de artigos; as
 * rotas de login/logout/upload de capa, já em produção, mantêm sua própria
 * checagem inline por não fazer parte desta fatia.
 */
export async function requireAdminRequest(
  request: Request,
  allowedRoles: AdminRole[] = ['ADMIN', 'EDITOR'],
): Promise<AdminGuardResult> {
  if (!isSameOriginRequest(request)) {
    return { ok: false, response: NextResponse.json({ error: 'Origem inválida.' }, { status: 403 }) }
  }

  const session = await auth()
  if (!session?.user) {
    return { ok: false, response: NextResponse.json({ error: 'Não autenticado.' }, { status: 401 }) }
  }

  try {
    requireRole(session.user.role as AdminRole, allowedRoles)
  } catch (error) {
    if (error instanceof ForbiddenRoleError) {
      return { ok: false, response: NextResponse.json({ error: 'Sem permissão.' }, { status: 403 }) }
    }
    throw error
  }

  return { ok: true, session }
}
