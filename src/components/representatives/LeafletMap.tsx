'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { PublicPartner } from '@/lib/content/partner-public-repository'
import { type LatLng, locatedPartners, nearestPartners, partnerPopupLabel } from '@/lib/content/partner-geo'

const REGIAO_SUL_CENTER: [number, number] = [-27.5, -51.5]
const REGIAO_SUL_ZOOM = 7
const USER_ZOOM = 10
const NEARBY_PARTNERS_LIMIT = 5

/**
 * Marcador em formato de pin (não um círculo simples) nas cores da empresa,
 * pedido do Jose — laranja para parceiro, azul para "Minha localização".
 */
function pinIcon(color: string): L.DivIcon {
  const svg = `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6.5" fill="#ffffff"/></svg>`
  return L.divIcon({ className: 'rep-marker', html: svg, iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -36] })
}

const userIcon = pinIcon('#0d4ba5')
const partnerIcon = pinIcon('#f26a21')

/** Foca no parceiro selecionado (clique no marcador ou na lista); sem seleção, quem decide o enquadramento inicial é `FitNearbyPartners`. */
function SelectionFocus({ selected }: { selected: PublicPartner | null }) {
  const map = useMap()
  useEffect(() => {
    if (selected?.approximateLat != null && selected.approximateLng != null) {
      map.flyTo([selected.approximateLat, selected.approximateLng], USER_ZOOM, { duration: 1 })
    }
  }, [selected, map])
  return null
}

/**
 * Ao obter a localização do visitante e sem nenhum parceiro selecionado
 * ainda, enquadra a posição dele junto dos parceiros mais próximos — pedido
 * do Jose: os marcadores próximos já devem aparecer, não só um zoom fechado
 * na posição do visitante que pode deixar os marcadores fora da tela.
 */
function FitNearbyPartners({ userPosition, partners, hasSelection }: { userPosition: LatLng | null; partners: PublicPartner[]; hasSelection: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!userPosition || hasSelection) return
    const nearby = nearestPartners(locatedPartners(partners), userPosition, NEARBY_PARTNERS_LIMIT)
    if (nearby.length === 0) {
      map.flyTo([userPosition.lat, userPosition.lng], USER_ZOOM, { duration: 1 })
      return
    }
    const bounds = L.latLngBounds([[userPosition.lat, userPosition.lng], ...nearby.map((partner): [number, number] => [partner.approximateLat, partner.approximateLng])])
    map.flyToBounds(bounds, { paddingTopLeft: [48, 48], paddingBottomRight: [48, 48], maxZoom: USER_ZOOM, duration: 1 })
  }, [userPosition, partners, hasSelection, map])
  return null
}

function PartnerMarkers({ partners, onSelectPartner }: { partners: PublicPartner[]; onSelectPartner: (id: string) => void }) {
  return (
    <>
      {locatedPartners(partners).map((partner) => (
        <Marker key={partner.id} position={[partner.approximateLat, partner.approximateLng]} icon={partnerIcon} eventHandlers={{ click: () => onSelectPartner(partner.id) }}>
          <Popup>{partnerPopupLabel(partner.type)}</Popup>
        </Marker>
      ))}
    </>
  )
}

function UserMarker({ position }: { position: LatLng | null }) {
  if (!position) return null
  return (
    <Marker position={[position.lat, position.lng]} icon={userIcon}>
      <Popup>Minha localização</Popup>
    </Marker>
  )
}

function initialCenter(userPosition: LatLng | null): [number, number] {
  return userPosition ? [userPosition.lat, userPosition.lng] : REGIAO_SUL_CENTER
}

function initialZoom(userPosition: LatLng | null): number {
  return userPosition ? USER_ZOOM : REGIAO_SUL_ZOOM
}

export function LeafletMap({
  partners,
  userPosition,
  selectedPartnerId,
  onSelectPartner,
}: {
  partners: PublicPartner[]
  userPosition: LatLng | null
  selectedPartnerId: string | null
  onSelectPartner: (id: string) => void
}) {
  const selected = partners.find((partner) => partner.id === selectedPartnerId) ?? null

  return (
    <MapContainer center={initialCenter(userPosition)} zoom={initialZoom(userPosition)} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SelectionFocus selected={selected} />
      <FitNearbyPartners userPosition={userPosition} partners={partners} hasSelection={selected != null} />
      <UserMarker position={userPosition} />
      <PartnerMarkers partners={partners} onSelectPartner={onSelectPartner} />
    </MapContainer>
  )
}
