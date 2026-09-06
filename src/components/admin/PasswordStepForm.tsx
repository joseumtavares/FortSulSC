'use client'

import { useState, type FormEvent } from 'react'

function EyeIcon({ crossed }: { crossed: boolean }) {
  if (crossed) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.5A9.6 9.6 0 0 1 12 5c5 0 9 4 10 7-.4 1.1-1.2 2.4-2.3 3.6M6.3 6.9C4.4 8.2 3 10 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function PasswordStepForm({
  email,
  password,
  submitting,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string
  password: string
  submitting: boolean
  error: string | null
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form className="admin-login-form" onSubmit={onSubmit} noValidate>
      <div className="admin-field">
        <label htmlFor="admin-email">E-mail</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
      </div>

      <div className="admin-field">
        <label htmlFor="admin-password">Senha</label>
        <div className="admin-field-control">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          <button
            type="button"
            className="admin-field-toggle"
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPassword((value) => !value)}
          >
            <EyeIcon crossed={showPassword} />
          </button>
        </div>
      </div>

      <div className="admin-form-message" role="alert" aria-live="assertive">
        {error}
      </div>

      <button type="submit" className="button admin-submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? 'Entrando...' : 'Entrar no painel'}
      </button>
    </form>
  )
}
