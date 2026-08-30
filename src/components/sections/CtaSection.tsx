import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export function CtaSection() {
  return (
    <section className="cta-section" id="contato" aria-labelledby="contato-title">
      <Reveal className="container cta-inner">
        <div>
          <span className="eyebrow eyebrow-light">Vamos conversar?</span>
          <h2 id="contato-title">O próximo ganho de eficiência pode começar aqui.</h2>
        </div>
        <WhatsAppTrigger className="button button-light" ariaLabel="Falar com a FortSul pelo WhatsApp">
          Falar com a FortSul
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </WhatsAppTrigger>
      </Reveal>
    </section>
  )
}
