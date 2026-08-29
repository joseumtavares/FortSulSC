import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export function PresenceSection() {
  return (
    <section className="section presence" id="presenca" aria-labelledby="presence-title">
      <div className="container presence-grid">
        <Reveal className="presence-copy">
          <span className="eyebrow">Perto de quem produz</span>
          <h2 id="presence-title">Representantes em diferentes regiões do Brasil.</h2>
          <p>Encontre atendimento comercial próximo e converse com quem entende a realidade do campo.</p>
          <WhatsAppTrigger className="button button-dark" ariaLabel="Encontrar representante via WhatsApp">
            Encontrar representante
          </WhatsAppTrigger>
        </Reveal>

        <Reveal delay className="map-wrap">
          <Image
            src="/image/FrtSulSC_Mapa-Representantes-Estados-Ativos.png"
            alt="Mapa de atuação dos representantes FortSul"
            width={1254}
            height={1254}
            sizes="(max-width: 820px) 100vw, 58vw"
          />
        </Reveal>
      </div>
    </section>
  )
}
