'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { RepresentativeMapPanel } from '@/components/representatives/RepresentativeMapPanel'

export function PresenceSection() {
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <section className="section presence" id="presenca" aria-labelledby="presence-title">
      <div className="container presence-grid">
        <Reveal className="presence-copy">
          <span className="eyebrow">Perto de quem produz</span>
          <h2 id="presence-title">Representantes em diferentes regiões do Brasil.</h2>
          <p>Encontre atendimento comercial próximo e converse com quem entende a realidade do campo.</p>
          <button type="button" className="button button-dark" onClick={() => setMapOpen(true)}>
            Encontrar representante
          </button>
        </Reveal>

        <Reveal delay className="map-wrap">
          <button type="button" className="map-trigger" onClick={() => setMapOpen(true)} aria-label="Abrir mapa interativo de representantes">
            <Image
              src="/image/FrtSulSC_Mapa-Representantes-Estados-Ativos.png"
              alt="Mapa de atuação dos representantes FortSul"
              width={1254}
              height={1254}
              sizes="(max-width: 820px) 100vw, 58vw"
            />
          </button>
        </Reveal>
      </div>

      <RepresentativeMapPanel open={mapOpen} onClose={() => setMapOpen(false)} />
    </section>
  )
}
