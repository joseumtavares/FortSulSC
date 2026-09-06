'use client'

import type { FormEvent, RefObject } from 'react'

export function CodeStepForm({
  email,
  code,
  codeInputRef,
  submitting,
  error,
  info,
  cooldown,
  onCodeChange,
  onSubmit,
  onResend,
}: {
  email: string
  code: string
  codeInputRef: RefObject<HTMLInputElement | null>
  submitting: boolean
  error: string | null
  info: string | null
  cooldown: number
  onCodeChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onResend: () => void
}) {
  return (
    <form className="admin-login-form" onSubmit={onSubmit} noValidate>
      <p className="admin-login-hint">
        Enviamos um código de 6 dígitos para <strong>{email}</strong>.
      </p>

      <div className="admin-field">
        <label htmlFor="admin-code">Código de verificação</label>
        <input
          id="admin-code"
          name="code"
          ref={codeInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, ''))}
        />
      </div>

      <div className="admin-form-message" role="alert" aria-live="assertive">
        {error}
      </div>
      <div className="admin-form-message admin-form-message-info" aria-live="polite">
        {info}
      </div>

      <button type="submit" className="button admin-submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? 'Verificando...' : 'Confirmar código'}
      </button>

      <button type="button" className="admin-resend" disabled={cooldown > 0 || submitting} onClick={onResend}>
        {cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
      </button>
    </form>
  )
}
