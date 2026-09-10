'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { ContentCardData, ContentGalleryImage } from './content-data'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const GALLERY_INTERVAL_MS = 4000

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function ArticleGalleryRotator({ gallery }: { gallery: ContentGalleryImage[] }) {
  const [index, setIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (gallery.length < 2 || !isAutoPlaying || prefersReducedMotion()) return

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % gallery.length)
    }, GALLERY_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [gallery, isAutoPlaying])

  if (gallery.length === 0) return null

  function goToImage(nextIndex: number) {
    setIsAutoPlaying(false)
    setIndex(((nextIndex % gallery.length) + gallery.length) % gallery.length)
  }

  return (
    <div className="content-article-gallery">
      <div className="content-article-gallery-media">
        {/* Mesmo motivo do ContentCard: imagem vem de storage externo (local://
            em dev, R2 em produção), fora do domínio configurável em next/image. */}
        <img src={gallery[index].src} alt={gallery[index].alt} />
      </div>

      {gallery.length > 1 && (
        <div className="content-article-gallery-controls">
          <button type="button" aria-label="Imagem anterior" onClick={() => goToImage(index - 1)}>
            ‹
          </button>
          <div className="content-article-gallery-dots" role="group" aria-label="Selecionar imagem">
            {gallery.map((image, imageIndex) => (
              <button
                key={image.src}
                type="button"
                aria-pressed={imageIndex === index}
                aria-label={`Imagem ${imageIndex + 1} de ${gallery.length}`}
                className={imageIndex === index ? 'is-active' : undefined}
                onClick={() => goToImage(imageIndex)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button type="button" aria-label="Próxima imagem" onClick={() => goToImage(index + 1)}>
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export function ContentArticleDialog({
  item,
  onClose,
}: {
  item: ContentCardData | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (item) {
      dialog.showModal()
      document.body.classList.add('dialog-open')
      closeButtonRef.current?.focus()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [item])

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

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
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

  function handleOverlayClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      dialogRef.current?.close()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="content-article-dialog"
      aria-modal="true"
      aria-labelledby="content-article-dialog-title"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      {item && (
        <div className="content-article-dialog-content">
          <button
            ref={closeButtonRef}
            type="button"
            className="content-article-dialog-close"
            aria-label="Fechar artigo"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>

          <div className="content-article-dialog-scroll">
            <h2 id="content-article-dialog-title">{item.title}</h2>
            <p className="content-article-dialog-body">{item.body}</p>

            <ArticleGalleryRotator key={item.id} gallery={item.gallery} />
          </div>
        </div>
      )}
    </dialog>
  )
}
