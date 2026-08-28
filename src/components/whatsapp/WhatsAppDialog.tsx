'use client'

import { useEffect, useRef } from 'react'
import { WHATSAPP_CHAT_URL, WHATSAPP_PHONE_DISPLAY, WHATSAPP_PHONE_TEL } from '@/lib/whatsapp'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function WhatsAppDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
      document.body.classList.add('dialog-open')
      closeButtonRef.current?.focus()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function handleClose() {
      document.body.classList.remove('dialog-open')
      onClose()
    }

    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  function getFocusableElements(): HTMLElement[] {
    const dialog = dialogRef.current
    if (!dialog) return []
    return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      (element) => !element.hasAttribute('hidden'),
    )
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      dialogRef.current?.close()
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)
    if (!firstElement || !lastElement) return

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  function handleOverlayClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      dialogRef.current?.close()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="whatsapp-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-dialog-title"
      aria-describedby="whatsapp-dialog-description"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div className="whatsapp-dialog-content">
        <button
          ref={closeButtonRef}
          className="whatsapp-dialog-close"
          type="button"
          aria-label="Fechar opções de contato"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
        <span className="eyebrow">Atendimento FortSul</span>
        <h2 id="whatsapp-dialog-title">Vamos conversar?</h2>
        <p id="whatsapp-dialog-description">
          Fale com a equipe FortSul pelo WhatsApp ou salve nosso número para entrar em contato quando
          precisar.
        </p>
        <a className="whatsapp-dialog-phone" href={`tel:${WHATSAPP_PHONE_TEL}`}>
          {WHATSAPP_PHONE_DISPLAY}
        </a>
        <a className="button" href={WHATSAPP_CHAT_URL} target="_blank" rel="noopener noreferrer">
          Abrir conversa no WhatsApp
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </dialog>
  )
}
