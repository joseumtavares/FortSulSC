import { describe, expect, it } from 'vitest'
import { WHATSAPP_PHONE_TEL } from '@/lib/whatsapp'
import { buildProductWhatsAppLink } from './product-whatsapp'

const digits = WHATSAPP_PHONE_TEL.replace(/[^0-9]/g, '')

describe('buildProductWhatsAppLink', () => {
  it('substitutes {produto} in a custom template', () => {
    const link = buildProductWhatsAppLink({ name: 'Alimentador de Cavaco', whatsappMessageTemplate: 'Quero saber mais sobre {produto}!' })
    expect(link).toBe(`https://wa.me/${digits}?text=${encodeURIComponent('Quero saber mais sobre Alimentador de Cavaco!')}`)
  })

  it('falls back to the default template when the product has none', () => {
    const link = buildProductWhatsAppLink({ name: 'Queimador', whatsappMessageTemplate: null })
    expect(link).toBe(`https://wa.me/${digits}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o produto Queimador.')}`)
  })

  it('falls back to the default template when the template is blank', () => {
    const link = buildProductWhatsAppLink({ name: 'Queimador', whatsappMessageTemplate: '   ' })
    expect(link).toBe(`https://wa.me/${digits}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre o produto Queimador.')}`)
  })

  it('keeps a custom template without the placeholder unchanged', () => {
    const link = buildProductWhatsAppLink({ name: 'Queimador', whatsappMessageTemplate: 'Fale com a gente!' })
    expect(link).toBe(`https://wa.me/${digits}?text=${encodeURIComponent('Fale com a gente!')}`)
  })
})
