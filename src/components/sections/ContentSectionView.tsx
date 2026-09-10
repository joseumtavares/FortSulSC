import { ContentCarousel } from '@/components/content/ContentCarousel'
import type { ContentCardData } from '@/components/content/content-data'
import { Reveal } from '@/components/ui/Reveal'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export function ContentSectionView({ items }: { items: ContentCardData[] }) {
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

        {items.length > 0 ? (
          <ContentCarousel items={items} />
        ) : (
          <p className="content-empty">Em breve, novidades e dicas por aqui.</p>
        )}

        <WhatsAppTrigger className="button button-dark content-cta" ariaLabel="Falar com a FortSul pelo WhatsApp">
          Falar com a FortSul
        </WhatsAppTrigger>
      </div>
    </section>
  )
}
