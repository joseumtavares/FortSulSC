'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { WhatsAppDialog } from './WhatsAppDialog'

type WhatsAppContextValue = {
  openDialog: (trigger?: HTMLElement | null) => void
}

const WhatsAppContext = createContext<WhatsAppContextValue | null>(null)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)

  const openDialog = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [])

  return (
    <WhatsAppContext.Provider value={{ openDialog }}>
      {children}
      <WhatsAppDialog open={isOpen} onClose={closeDialog} />
    </WhatsAppContext.Provider>
  )
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext)
  if (!context) {
    throw new Error('useWhatsApp deve ser usado dentro de WhatsAppProvider')
  }
  return context
}
