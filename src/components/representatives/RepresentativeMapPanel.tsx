'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { PublicPartner } from '@/lib/content/partner-public-repository'
import { buildPartnerWhatsAppLink } from '@/lib/content/partner-whatsapp'
import { buildFortSulSearchWhatsAppLink } from '@/lib/content/fortsul-whatsapp'

const LeafletMap = dynamic(() => import('./LeafletMap').then((module_) => module_.LeafletMap), { ssr: false })

type GeoStatus = 'pending' | 'granted' | 'denied' | 'unsupported'

function geoStatusMessage(status: GeoStatus): string {
  switch (status) {
    case 'granted':
      return 'Mostrando representantes perto de você.'
    case 'denied':
      return 'Localização não autorizada — busque por cidade ou navegue no mapa.'
    case 'unsupported':
      return 'Seu navegador não suporta localização — busque por cidade ou navegue no mapa.'
    default:
      return 'Buscando sua localização…'
  }
}

function partnerTypeLabel(type: PublicPartner['type']): string {
  return type === 'REPRESENTATIVE' ? 'Representante' : 'Revenda'
}

function RepresentativeCard({ partner, open }: { partner: PublicPartner; open: boolean }) {
  return (
    <div className="rep-card">
      <div className="rep-card-header">
        {partner.logoUrl && <img src={partner.logoUrl} alt={`Logo de ${partner.name}`} className="rep-card-logo" />}
        <div>
          <h3>{partner.name}</h3>
          <p>{partnerTypeLabel(partner.type)}</p>
        </div>
      </div>
      {partner.description && <p>{partner.description}</p>}
      {partner.municipalities.length > 0 && <p className="rep-card-municipalities">Atende: {partner.municipalities.join(', ')}</p>}
      <a className="button button-sm" href={buildPartnerWhatsAppLink(partner)} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
        Falar no WhatsApp
      </a>
    </div>
  )
}

function matchesSearch(partner: PublicPartner, term: string): boolean {
  return partner.name.toLowerCase().includes(term) || partner.municipalities.some((city) => city.toLowerCase().includes(term))
}

/** Sem resultado para uma busca ativa: encaminha para o contato geral da FortSul, com a busca na mensagem. */
function NoResultsFallback({ query, open }: { query: string; open: boolean }) {
  return (
    <div className="rep-card">
      <h3>Ainda não temos representante em &ldquo;{query}&rdquo;</h3>
      <p>Fale direto com a FortSul — vamos te ajudar a encontrar a solução certa.</p>
      <a className="button button-sm" href={buildFortSulSearchWhatsAppLink(query)} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
        Falar no WhatsApp
      </a>
    </div>
  )
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function RepresentativeMapPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [partners, setPartners] = useState<PublicPartner[]>([])
  const [loadError, setLoadError] = useState(false)
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('pending')
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()
    document.body.classList.add('dialog-open')

    function getFocusableElements(): HTMLElement[] {
      return [...(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [])]
    }

    function trapTab(event: KeyboardEvent) {
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'Tab') {
        trapTab(event)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('dialog-open')
      lastFocusedRef.current?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setSearch('')
    setSelectedId(null)
    setLoadError(false)

    let cancelled = false
    fetch('/api/public/partners')
      .then((response) => {
        if (!response.ok) throw new Error('Falha ao carregar parceiros.')
        return response.json() as Promise<PublicPartner[]>
      })
      .then((data) => { if (!cancelled) setPartners(data) })
      .catch(() => { if (!cancelled) setLoadError(true) })

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('unsupported')
    } else {
      setGeoStatus('pending')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return
          setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude })
          setGeoStatus('granted')
        },
        () => { if (!cancelled) setGeoStatus('denied') },
        { timeout: 8000 },
      )
    }

    return () => { cancelled = true }
  }, [open])

  const searchTerm = search.trim().toLowerCase()
  const results = useMemo(
    () => (searchTerm ? partners.filter((partner) => matchesSearch(partner, searchTerm)) : partners),
    [partners, searchTerm],
  )
  const selected = partners.find((partner) => partner.id === selectedId) ?? null

  return (
    <div className="rep-panel" data-open={open} aria-hidden={!open}>
      <button
        type="button"
        className="rep-panel-backdrop"
        aria-label="Fechar mapa de representantes"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <div ref={sheetRef} className="rep-panel-sheet" role="dialog" aria-modal="true" aria-labelledby="rep-panel-title">
        <button ref={closeButtonRef} type="button" className="rep-panel-close" aria-label="Fechar" onClick={onClose} tabIndex={open ? 0 : -1}>
          ×
        </button>
        <div className="rep-panel-body">
          <div className="rep-panel-map">
            {open && <LeafletMap partners={partners} userPosition={userPosition} selectedPartnerId={selectedId} onSelectPartner={setSelectedId} />}
          </div>
          <div className="rep-panel-side">
            <button type="button" className="rep-panel-back" onClick={onClose} tabIndex={open ? 0 : -1}>
              <span aria-hidden="true">←</span> Voltar ao site
            </button>
            <h2 id="rep-panel-title">Encontre um representante</h2>
            <p className="rep-geo-status">{geoStatusMessage(geoStatus)}</p>
            <label className="sr-only" htmlFor="rep-search">Buscar por cidade ou representante</label>
            <input
              id="rep-search"
              type="search"
              className="rep-search"
              placeholder="Buscar por cidade ou nome"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              tabIndex={open ? 0 : -1}
            />
            {loadError && <p className="rep-empty">Não foi possível carregar os representantes agora.</p>}
            {!loadError && results.length === 0 && (searchTerm
              ? <NoResultsFallback query={search.trim()} open={open} />
              : <p className="rep-empty">Nenhum representante encontrado.</p>)}
            <ul className="rep-results">
              {results.map((partner) => (
                <li key={partner.id}>
                  <button
                    type="button"
                    className="rep-result-button"
                    aria-current={partner.id === selectedId}
                    onClick={() => setSelectedId(partner.id)}
                    tabIndex={open ? 0 : -1}
                  >
                    <span>{partner.name}</span>
                    <span>{partnerTypeLabel(partner.type)}</span>
                  </button>
                </li>
              ))}
            </ul>
            {selected && <RepresentativeCard partner={selected} open={open} />}
          </div>
        </div>
      </div>
    </div>
  )
}
