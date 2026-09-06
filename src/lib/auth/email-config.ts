export type EmailDeliveryConfig =
  | { provider: 'console' }
  | { provider: 'resend'; apiKey: string; from: string }

function required(name: 'RESEND_API_KEY' | 'RESEND_FROM_EMAIL'): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} ausente — obrigatório para entrega de e-mail em produção.`)
  return value
}

/**
 * Ponto único de composição da entrega de e-mails. Em desenvolvimento não
 * existe chamada externa; produção usa somente o provedor aprovado.
 */
export function getEmailDeliveryConfig(): EmailDeliveryConfig {
  const provider = process.env.EMAIL_PROVIDER ?? 'console'
  if (provider === 'console') return { provider: 'console' }

  if (provider !== 'resend') {
    throw new Error('EMAIL_PROVIDER deve ser "console" ou "resend".')
  }

  return {
    provider: 'resend',
    apiKey: required('RESEND_API_KEY'),
    from: required('RESEND_FROM_EMAIL'),
  }
}
