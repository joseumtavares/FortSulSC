'use client'

import type { ReactNode } from 'react'
import { useWhatsApp } from './WhatsAppProvider'

export function WhatsAppTrigger({
  className,
  ariaLabel,
  children,
}: {
  className?: string
  ariaLabel?: string
  children: ReactNode
}) {
  const { openDialog } = useWhatsApp()

  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      onClick={(event) => openDialog(event.currentTarget)}
    >
      {children}
    </button>
  )
}
