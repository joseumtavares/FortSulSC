'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { SolutionCardData, SolutionGalleryImage } from './solutions-data'
import { appendProductUrlToWhatsAppLink } from '@/lib/content/product-whatsapp'

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const GALLERY_INTERVAL_MS = 4000

type TestimonialPlatform = SolutionCardData['testimonials'][number]['platform']

const PLATFORM_LABELS: Record<TestimonialPlatform, string> = {
  TIKTOK: 'TikTok',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
}

function PlatformIcon({ platform }: { platform: TestimonialPlatform }) {
  if (platform === 'FACEBOOK') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.23 10.44 22v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22C18.34 21.23 22 17.08 22 12.06Z" /></svg>
  }
  if (platform === 'INSTAGRAM') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44.54c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2Zm0 3.24a6.76 6.76 0 1 0 0 13.52 6.76 6.76 0 0 0 0-13.52Zm0 11.14a4.38 4.38 0 1 1 0-8.76 4.38 4.38 0 0 1 0 8.76Zm7.02-11.4a1.58 1.58 0 1 1-3.15 0 1.58 1.58 0 0 1 3.15 0Z" /></svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M16.6 5.82c-.98-.86-1.5-2.06-1.5-3.32h-3.05v13.6a3.03 3.03 0 1 1-2.13-2.9V10.1a6.1 6.1 0 1 0 5.18 6.03V9.2a8.14 8.14 0 0 0 4.63 1.44V7.6a4.85 4.85 0 0 1-3.13-1.78Z" /></svg>
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
  const whatsappHref = item
    ? appendProductUrlToWhatsAppLink(item.whatsappLink, `${window.location.origin}${window.location.pathname}?produto=${item.slug}`)
    : ''

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
                        <PlatformIcon platform={testimonial.platform} />
                        {PLATFORM_LABELS[testimonial.platform]}{testimonial.authorName ? ` — ${testimonial.authorName}` : ''}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="product-dialog-actions">
              {item.catalogUrl && <a href={item.catalogUrl} target="_blank" rel="noopener noreferrer" className="button button-light">Baixar catálogo</a>}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="button button-dark">Saiba mais</a>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
