import type { PublicPartner } from './partner-public-repository'

export type LatLng = { lat: number; lng: number }
export type LocatedPartner = PublicPartner & { approximateLat: number; approximateLng: number }

export function locatedPartners(partners: PublicPartner[]): LocatedPartner[] {
  return partners.filter((partner): partner is LocatedPartner => partner.approximateLat != null && partner.approximateLng != null)
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const EARTH_RADIUS_KM = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function nearestPartners(partners: LocatedPartner[], position: LatLng, limit: number): LocatedPartner[] {
  return [...partners]
    .sort((a, b) => haversineKm(position, { lat: a.approximateLat, lng: a.approximateLng }) - haversineKm(position, { lat: b.approximateLat, lng: b.approximateLng }))
    .slice(0, limit)
}

export function partnerPopupLabel(type: PublicPartner['type']): string {
  return type === 'REPRESENTATIVE' ? 'Representante autorizado' : 'Revendedor autorizado'
}
