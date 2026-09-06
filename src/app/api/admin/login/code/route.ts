import { NextResponse, type NextRequest } from 'next/server'
import { isSameOriginRequest } from '@/lib/auth/origin-check'
import { PENDING_LOGIN_COOKIE_NAME } from '@/lib/auth/pending-login'
import { readJsonObject } from '@/lib/auth/request-body'
import { processCodeLogin } from '@/lib/auth/code-login'

function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) return errorResponse(403, 'Origem inválida.')

  const body = await readJsonObject(request)
  const code = typeof body?.code === 'string' ? body.code.trim() : null
  const pendingLoginId = request.cookies.get(PENDING_LOGIN_COOKIE_NAME)?.value
  if (!code || !pendingLoginId) return errorResponse(401, 'Sessão de login expirada.')

  const result = await processCodeLogin({ code, pendingLoginId, request })
  if (result.kind === 'authenticated') {
    const response = NextResponse.json({ step: 'authenticated' }, { status: 200 })
    response.cookies.delete(PENDING_LOGIN_COOKIE_NAME)
    return response
  }
  if (result.kind === 'blocked') return errorResponse(429, 'Muitas tentativas. Tente novamente mais tarde.')
  if (result.kind === 'session_expired') return errorResponse(401, 'Sessão de login expirada.')
  return errorResponse(401, 'Código inválido ou expirado.')
}
