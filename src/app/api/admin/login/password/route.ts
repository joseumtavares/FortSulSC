import { NextResponse, type NextRequest } from 'next/server'
import { requireSecureAuthCookies } from '@/lib/auth/env'
import { isSameOriginRequest } from '@/lib/auth/origin-check'
import { DEVICE_COOKIE_MAX_AGE_SECONDS, DEVICE_COOKIE_NAME } from '@/lib/auth/device'
import { PENDING_LOGIN_COOKIE_NAME, PENDING_LOGIN_TTL_MS } from '@/lib/auth/pending-login'
import { AUTH_SERVICE_UNAVAILABLE_CODE } from '@/lib/auth/public-error'
import { readJsonObject } from '@/lib/auth/request-body'
import { processPasswordLogin } from '@/lib/auth/password-login'
import { logger } from '@/lib/logger'

function genericError(): NextResponse {
  return NextResponse.json({ error: 'Credenciais inválidas ou conta temporariamente bloqueada.' }, { status: 401 })
}

function blockedError(): NextResponse {
  return NextResponse.json({ error: 'Credenciais inválidas ou conta temporariamente bloqueada.' }, { status: 429 })
}

function unavailableError(): NextResponse {
  return NextResponse.json(
    { error: 'Não foi possível iniciar o login. Tente novamente em instantes.', code: AUTH_SERVICE_UNAVAILABLE_CODE },
    { status: 503 },
  )
}

function setDeviceCookie(response: NextResponse, deviceId: string): void {
  response.cookies.set(DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: requireSecureAuthCookies(),
    sameSite: 'lax',
    maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
    path: '/',
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginRequest(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 })

    const body = await readJsonObject(request)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null
    const password = typeof body?.password === 'string' ? body.password : null
    if (!email || !password) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })

    const result = await processPasswordLogin({ email, password, request })
    const response = result.kind === 'blocked' ? blockedError() : result.kind === 'sent'
      ? NextResponse.json({ step: 'code_sent' }, { status: 200 })
      : genericError()
    setDeviceCookie(response, result.deviceId)
    if (result.kind !== 'sent') return response

    response.cookies.set(PENDING_LOGIN_COOKIE_NAME, result.pendingLoginId, {
      httpOnly: true,
      secure: result.secureCookies,
      sameSite: 'strict',
      maxAge: Math.floor(PENDING_LOGIN_TTL_MS / 1000),
      path: '/',
    })
    return response
  } catch {
    logger.error('auth.password_login_unavailable')
    return unavailableError()
  }
}
