export interface LoginCodeEmailInput {
  to: string
  name: string
  code: string
}

export interface EmailSender {
  sendLoginCode(input: LoginCodeEmailInput): Promise<void>
}

/**
 * Remetente de desenvolvimento — nunca envia e-mail de verdade, só registra
 * que a entrega seria simulada. A escolha do provedor real fica concentrada
 * na configuração, e nenhuma credencial é escrita nos logs.
 */
class ConsoleEmailSender implements EmailSender {
  sendLoginCode(): Promise<void> {
    logger.info('auth.login_code_delivery_simulated')
    return Promise.resolve()
  }
}

class ResendEmailSender implements EmailSender {
  constructor(
    private readonly resend: Resend,
    private readonly from: string,
  ) {}

  async sendLoginCode({ to, name, code }: LoginCodeEmailInput): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: [to],
      subject: 'Seu código de acesso FortSulSC',
      text: `Olá, ${name}. Seu código de acesso é ${code}. Ele expira em 10 minutos.`,
    })

    if (error) {
      // A categoria e o status ajudam a corrigir configuração, domínio ou
      // permissões. Não registramos a mensagem do provedor: ela pode trazer
      // detalhes desnecessários sobre destinatário ou conta externa.
      logger.error('auth.login_code_delivery_failed', {
        providerError: error.name,
        providerStatus: error.statusCode ?? 'unknown',
      })
      throw new Error('Falha ao enviar o código de acesso.')
    }
  }
}

export function getEmailSender(): EmailSender {
  const config = getEmailDeliveryConfig()
  if (config.provider === 'console') return new ConsoleEmailSender()
  return new ResendEmailSender(new Resend(config.apiKey), config.from)
}
import { Resend } from 'resend'
import { logger } from '@/lib/logger'
import { getEmailDeliveryConfig } from './email-config'
