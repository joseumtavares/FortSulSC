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
