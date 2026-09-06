'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { FloatingWhatsApp } from '@/components/whatsapp/FloatingWhatsApp'
import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'

// `/admin` tem layout próprio (sem chrome público) e ainda não vive num route
// group isolado do site público — ver docs/ARCHITECTURE.md seção 5, que
// reserva essa reorganização de pastas para validação futura separada.
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <WhatsAppProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
      <FloatingWhatsApp />
    </WhatsAppProvider>
  )
}
