'use client'

import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { PublicPartner } from '@/lib/content/partner-public-repository'

const REGIAO_SUL_CENTER: [number, number] = [-27.5, -51.5]
const REGIAO_SUL_ZOOM = 7
const USER_ZOOM = 10

function markerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'rep-marker',
    html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

const userIcon = markerIcon('#0d4ba5')
const partnerIcon = markerIcon('#f26a21')

function MapFocus({ lat, lng, zoom }: { lat: number | null; lng: number | null; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) map.flyTo([lat, lng], zoom, { duration: 1 })
  }, [lat, lng, zoom, map])
  return null
}

function locatedPartners(partners: PublicPartner[]): (PublicPartner & { approximateLat: number; approximateLng: number })[] {
  return partners.filter((partner): partner is PublicPartner & { approximateLat: number; approximateLng: number } => partner.approximateLat != null && partner.approximateLng != null)
}

function PartnerMarkers({ partners, onSelectPartner }: { partners: PublicPartner[]; onSelectPartner: (id: string) => void }) {
  return (
    <>
      {locatedPartners(partners).map((partner) => (
        <Marker key={partner.id} position={[partner.approximateLat, partner.approximateLng]} icon={partnerIcon} eventHandlers={{ click: () => onSelectPartner(partner.id) }}>
          <Popup>{partner.name}</Popup>
        </Marker>
      ))}
    </>
  )
}

function UserMarker({ position }: { position: { lat: number; lng: number } | null }) {
  if (!position) return null
  return (
    <Marker position={[position.lat, position.lng]} icon={userIcon}>
      <Popup>Minha localização</Popup>
    </Marker>
  )
}

function initialCenter(userPosition: { lat: number; lng: number } | null): [number, number] {
  return userPosition ? [userPosition.lat, userPosition.lng] : REGIAO_SUL_CENTER
}

function initialZoom(userPosition: { lat: number; lng: number } | null): number {
  return userPosition ? USER_ZOOM : REGIAO_SUL_ZOOM
}

function focusCoordinate(selected: PublicPartner | null, userPosition: { lat: number; lng: number } | null): { lat: number | null; lng: number | null } {
  return {
    lat: selected?.approximateLat ?? userPosition?.lat ?? null,
    lng: selected?.approximateLng ?? userPosition?.lng ?? null,
  }
}

export function LeafletMap({
  partners,
  userPosition,
  selectedPartnerId,
  onSelectPartner,
}: {
  partners: PublicPartner[]
  userPosition: { lat: number; lng: number } | null
  selectedPartnerId: string | null
  onSelectPartner: (id: string) => void
}) {
  const selected = partners.find((partner) => partner.id === selectedPartnerId) ?? null
  const focus = focusCoordinate(selected, userPosition)

  return (
    <MapContainer center={initialCenter(userPosition)} zoom={initialZoom(userPosition)} scrollWheelZoom style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFocus lat={focus.lat} lng={focus.lng} zoom={USER_ZOOM} />
      <UserMarker position={userPosition} />
      <PartnerMarkers partners={partners} onSelectPartner={onSelectPartner} />
    </MapContainer>
  )
}
