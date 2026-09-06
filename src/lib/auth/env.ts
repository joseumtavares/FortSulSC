export function requireMfaCodePepper(): string {
  const pepper = process.env.MFA_CODE_PEPPER
  if (!pepper) {
    throw new Error('MFA_CODE_PEPPER ausente — obrigatório para operações de autenticação.')
  }
  return pepper
}

export function requireAuthOrigin(): string {
  const origin = process.env.AUTH_ORIGIN
  if (!origin) throw new Error('AUTH_ORIGIN ausente — obrigatório para validar requisições de autenticação.')

  try {
    return new URL(origin).origin
  } catch {
    throw new Error('AUTH_ORIGIN deve conter uma origem HTTP(S) válida.')
  }
}

/**
 * Em produção, cookies de autenticação só podem viajar por HTTPS. No Docker
 * local o teste usa HTTP, então a escolha precisa ser explícita no .env —
 * nunca é deduzida silenciosamente a partir de NODE_ENV.
 */
export function requireSecureAuthCookies(): boolean {
  const value = process.env.AUTH_COOKIE_SECURE
  if (value === 'true') return true
  if (value === 'false') return false

  throw new Error('AUTH_COOKIE_SECURE deve ser true ou false.')
}
