/**
 * Defesa CSRF de baixo nível para os endpoints REST próprios de login
 * (fora do `signIn` do Auth.js, que já tem sua própria proteção CSRF).
 * Rejeita qualquer requisição cuja origem declarada não bata com a origem
 * da própria aplicação.
 */
import { requireAuthOrigin } from './env'

export function isSameOriginRequest(request: Request): boolean {
  const expectedOrigin = requireAuthOrigin()

  const origin = request.headers.get('origin')
  if (origin) {
    return origin === expectedOrigin
  }

  const referer = request.headers.get('referer')
  if (!referer) {
    return false
  }

  try {
    return new URL(referer).origin === expectedOrigin
  } catch {
    return false
  }
}
