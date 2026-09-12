import { describe, expect, it } from 'vitest'
import { buildPartnerWhatsAppLink } from './partner-whatsapp'

describe('buildPartnerWhatsAppLink', () => {
  it('strips non-digit characters from the phone number', () => {
    const link = buildPartnerWhatsAppLink({ name: 'Fulano', whatsapp: '+55 (48) 99999-0000' })
    expect(link.startsWith('https://wa.me/5548999990000?text=')).toBe(true)
  })

  it('greets the partner by name and asks for more information', () => {
    const link = buildPartnerWhatsAppLink({ name: 'Fulano de Tal', whatsapp: '5548999990000' })
    const message = decodeURIComponent(new URL(link).searchParams.get('text') ?? '')
    expect(message).toBe('Olá, Fulano de Tal! Encontrei seu contato no site da FortSul, gostaria de mais informações.')
  })
})
