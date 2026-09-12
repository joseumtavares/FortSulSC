/**
 * Link `wa.me` do próprio parceiro (número dele, não o da FortSul) — mesmo
 * padrão de sanitização de dígitos usado em `product-whatsapp.ts`.
 */
export function buildPartnerWhatsAppLink(partner: { name: string; whatsapp: string }): string {
  const digits = partner.whatsapp.replace(/[^0-9]/g, '')
  const message = `Olá! Encontrei o contato de ${partner.name} no site da FortSul.`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
