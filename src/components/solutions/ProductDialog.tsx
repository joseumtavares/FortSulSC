'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { SolutionCardData, SolutionGalleryImage } from './solutions-data'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const GALLERY_INTERVAL_MS = 4000

const PLATFORM_LABELS: Record<SolutionCardData['testimonials'][number]['platform'], string> = {
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function ProductGalleryRotator({ gallery }: { gallery: SolutionGalleryImage[] }) {
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
        <img src={gallery[index].src} alt={gallery[index].alt} />
      </div>

      {gallery.length > 1 && (
        <div className="content-article-gallery-controls">
          <button type="button" aria-label="Imagem anterior" onClick={() => goToImage(index - 1)}>‹</button>
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
          <button type="button" aria-label="Próxima imagem" onClick={() => goToImage(index + 1)}>›</button>
        </div>
      )}
    </div>
  )
}

export function ProductDialog({ item, onClose }: { item: SolutionCardData | null; onClose: () => void }) {
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
    return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter((element) => !element.hasAttribute('hidden'))
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

  const gallery = item ? (item.heroImage ? [item.heroImage, ...item.gallery] : item.gallery) : []

  return (
    <dialog
      ref={dialogRef}
      className="content-article-dialog"
      aria-modal="true"
      aria-labelledby="product-dialog-title"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      {item && (
        <div className="content-article-dialog-content">
          <button ref={closeButtonRef} type="button" className="content-article-dialog-close" aria-label="Fechar produto" onClick={() => dialogRef.current?.close()}>×</button>

          <div className="content-article-dialog-scroll">
            {item.eyebrow && <span className="eyebrow">{item.eyebrow}</span>}
            <h2 id="product-dialog-title">{item.name}</h2>
            {item.shortDescription && <p className="content-article-dialog-body">{item.shortDescription}</p>}
            {item.description && <p className="content-article-dialog-body">{item.description}</p>}

            <ProductGalleryRotator key={item.id} gallery={gallery} />

            {item.applications.length > 0 && (
              <div className="product-dialog-section">
                <h3>Aplicações</h3>
                <ul>{item.applications.map((application) => <li key={application}>{application}</li>)}</ul>
              </div>
            )}

            {item.specifications.length > 0 && (
              <div className="product-dialog-section">
                <h3>Especificações</h3>
                <table className="product-dialog-specs">
                  <tbody>
                    {item.specifications.map((specification) => (
                      <tr key={specification.label}><th scope="row">{specification.label}</th><td>{specification.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {item.testimonials.length > 0 && (
              <div className="product-dialog-section">
                <h3>Depoimentos</h3>
                <ul className="product-dialog-testimonials">
                  {item.testimonials.map((testimonial) => (
                    <li key={testimonial.url}>
                      <a href={testimonial.url} target="_blank" rel="noopener noreferrer">
                        {PLATFORM_LABELS[testimonial.platform]}{testimonial.authorName ? ` — ${testimonial.authorName}` : ''}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-dialog-actions">
              {item.catalogUrl && <a href={item.catalogUrl} target="_blank" rel="noopener noreferrer" className="button button-light">Baixar catálogo</a>}
              <a href={item.whatsappLink} target="_blank" rel="noopener noreferrer" className="button button-dark">Saiba mais</a>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
