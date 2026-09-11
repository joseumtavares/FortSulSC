import { WHATSAPP_PHONE_TEL } from '@/lib/whatsapp'

const DEFAULT_TEMPLATE = 'Olá! Gostaria de saber mais sobre o produto {produto}.'
const PLACEHOLDER = '{produto}'

/**
 * Monta o link `wa.me` do botão "Saiba mais" de um produto, substituindo o
 * placeholder `{produto}` pelo nome do produto. Sem `utm_source`: o exemplo
 * original vinha de um link gerado por IA, não de uma decisão de marketing.
 */
export function buildProductWhatsAppLink(product: { name: string; whatsappMessageTemplate: string | null }): string {
  const template = product.whatsappMessageTemplate?.trim() || DEFAULT_TEMPLATE
  const message = template.includes(PLACEHOLDER) ? template.replaceAll(PLACEHOLDER, product.name) : template
  const digits = WHATSAPP_PHONE_TEL.replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * Acrescenta o link do produto ao final da mensagem já montada, para que o
 * cliente receba o link direto (sem precisar navegar pelo site) junto com o
 * texto pré-definido no painel. `productUrl` é resolvido no navegador
 * (origem + slug), já que a home é gerada estaticamente e não deve depender
 * de leitura de headers em tempo de build.
 */
export function appendProductUrlToWhatsAppLink(whatsappLink: string, productUrl: string): string {
  const url = new URL(whatsappLink)
  const currentText = url.searchParams.get('text') ?? ''
  url.searchParams.set('text', `${currentText}\n\n${productUrl}`)
  return url.toString()
}
