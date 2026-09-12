import { describe, expect, it } from 'vitest'
import { buildFortSulSearchWhatsAppLink } from './fortsul-whatsapp'
import { WHATSAPP_PHONE_TEL } from '@/lib/whatsapp'

describe('buildFortSulSearchWhatsAppLink', () => {
  it('points to the FortSul number, not a partner number', () => {
    const link = buildFortSulSearchWhatsAppLink('Orleans')
    const digits = WHATSAPP_PHONE_TEL.replace(/[^0-9]/g, '')
    expect(link.startsWith(`https://wa.me/${digits}?text=`)).toBe(true)
  })

  it('includes the searched term in the message', () => {
    const link = buildFortSulSearchWhatsAppLink('Orleans')
    const message = decodeURIComponent(new URL(link).searchParams.get('text') ?? '')
    expect(message).toBe('Olá! Procurei um representante em Orleans no site da FortSul.')
  })
})
