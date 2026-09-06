'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { PasswordStepForm } from './PasswordStepForm'
import { CodeStepForm } from './CodeStepForm'
import { AUTH_SERVICE_UNAVAILABLE_CODE } from '@/lib/auth/public-error'

type Step = 'password' | 'code'
type PasswordRequestResult = 'sent' | 'invalid' | 'unavailable'

const RESEND_COOLDOWN_SECONDS = 60
const GENERIC_PASSWORD_ERROR = 'Credenciais inválidas ou conta temporariamente bloqueada.'
const PASSWORD_LOGIN_UNAVAILABLE = 'Não foi possível iniciar o login. Tente novamente em instantes.'
const GENERIC_CODE_ERROR = 'Código inválido ou expirado.'
const GENERIC_CODE_BLOCKED = 'Muitas tentativas. Tente novamente mais tarde.'
const RESEND_COOLDOWN_MESSAGE = 'Aguarde antes de solicitar outro código.'

async function readJson(response: Response): Promise<{ step?: string; error?: string; code?: string } | null> {
  const data = await response.json().catch(() => null) as unknown
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const record = data as Record<string, unknown>
  return {
    step: typeof record.step === 'string' ? record.step : undefined,
    error: typeof record.error === 'string' ? record.error : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
  }
}

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus()
  }, [step])

  async function requestCode(): Promise<PasswordRequestResult> {
    try {
      const response = await fetch('/api/admin/login/password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await readJson(response)
      if (response.ok && data?.step === 'code_sent') {
        setCooldown(RESEND_COOLDOWN_SECONDS)
        return 'sent'
      }
      return data?.code === AUTH_SERVICE_UNAVAILABLE_CODE || response.status >= 500 ? 'unavailable' : 'invalid'
    } catch {
      return 'unavailable'
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInfo(null)

    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.')
      return
    }

    setSubmitting(true)
    try {
      const result = await requestCode()
      if (result === 'sent') {
        setStep('code')
      } else {
        setError(result === 'unavailable' ? PASSWORD_LOGIN_UNAVAILABLE : GENERIC_PASSWORD_ERROR)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || submitting) return
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      const result = await requestCode()
      if (result === 'sent') {
        setCode('')
        setInfo('Novo código enviado para o seu e-mail.')
      } else if (result === 'unavailable') {
        setError(PASSWORD_LOGIN_UNAVAILABLE)
      } else {
        setInfo(RESEND_COOLDOWN_MESSAGE)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInfo(null)

    if (!code.trim()) {
      setError('Informe o código recebido por e-mail.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/login/code', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await readJson(response)
      if (response.ok && data?.step === 'authenticated') {
        router.push('/admin/session-check')
        return
      }
      setError(response.status === 429 ? GENERIC_CODE_BLOCKED : GENERIC_CODE_ERROR)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'password') {
    return (
      <PasswordStepForm
        email={email}
        password={password}
        submitting={submitting}
        error={error}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={(event) => { void handlePasswordSubmit(event) }}
      />
    )
  }

  return (
    <CodeStepForm
      email={email}
      code={code}
      codeInputRef={codeInputRef}
      submitting={submitting}
      error={error}
      info={info}
      cooldown={cooldown}
      onCodeChange={setCode}
      onSubmit={(event) => { void handleCodeSubmit(event) }}
      onResend={() => { void handleResend() }}
    />
  )
}
