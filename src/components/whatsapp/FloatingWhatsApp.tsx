'use client'

import { WhatsAppTrigger } from './WhatsAppTrigger'

export function FloatingWhatsApp() {
  return (
    <WhatsAppTrigger className="whatsapp-float" ariaLabel="Abrir opções de contato via WhatsApp">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4.1Z" />
        <path d="M8.3 7.7c.3-.3.8-.3 1 0l1 1.7c.2.3.1.7-.1 1l-.5.5c.7 1.5 1.9 2.7 3.4 3.4l.5-.5c.3-.3.7-.3 1-.1l1.7 1c.4.2.4.7.1 1-1 1.1-2.4 1.3-3.7.8-2.7-1-5.1-3.4-6.1-6.1-.5-1.3-.3-2.7.8-3.7Z" />
      </svg>
    </WhatsAppTrigger>
  )
}
