import { WHATSAPP_PHONE_TEL } from '@/lib/whatsapp'

/**
 * Link `wa.me` da própria FortSul (não de um parceiro) para quando a busca no
 * mapa de representantes não encontra ninguém na cidade/nome pesquisado —
 * inclui o termo pesquisado na mensagem, pedido do Jose.
 */
export function buildFortSulSearchWhatsAppLink(query: string): string {
  const digits = WHATSAPP_PHONE_TEL.replace(/[^0-9]/g, '')
  const message = `Olá! Procurei um representante em ${query} no site da FortSul.`
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
