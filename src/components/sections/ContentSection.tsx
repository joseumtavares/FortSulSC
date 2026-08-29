import { ContentCard } from '@/components/content/ContentCard'
import { contentCards } from '@/components/content/content-data'
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export function ContentSection() {
  return (
    <section className="section content-section" id="novidades-e-dicas" aria-labelledby="novidades-e-dicas-title">
      <div className="container">
        <Reveal className="content-heading">
          <div>
            <span className="eyebrow">Dicas FortSul</span>
            <h2 id="novidades-e-dicas-title">Novidades e dicas</h2>
          </div>
          <p>Informações e dicas para ajudar você a conhecer melhor os equipamentos e soluções da FortSul.</p>
        </Reveal>

        <ul className="content-grid" aria-labelledby="novidades-e-dicas-title">
          {contentCards.map((item, index) => <ContentCard key={item.title} item={item} delay={index % 2 === 1} />)}
        </ul>

        <WhatsAppTrigger className="button button-dark content-cta" ariaLabel="Falar com a FortSul pelo WhatsApp">
          Falar com a FortSul
        </WhatsAppTrigger>
      </div>
    </section>
  )
}
