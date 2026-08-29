import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <Image
        className="hero-media"
        src="/image/alimentador-reto-fundo-plantacao.webp"
        alt=""
        fill
        sizes="100vw"
        preload
      />
      <div className="container hero-inner">
        <Reveal className="hero-copy">
          <span className="eyebrow eyebrow-light">Tecnologia feita para o campo</span>
          <h1 id="hero-title">Mais eficiência para quem faz a produção acontecer.</h1>
          <p>
            Equipamentos agrícolas desenvolvidos para simplificar processos, elevar a produtividade e
            acompanhar a rotina real do produtor.
          </p>
          <div className="hero-actions">
            <a className="button" href="#solucoes">
              Conheça as soluções
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a className="text-link text-link-light" href="#empresa">
              Por que escolher a FortSul <span aria-hidden="true">↘</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay className="hero-note">
          <span className="hero-note-icon">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <div>
            <strong>Do projeto ao pós-venda</strong>
            <span>Uma equipe próxima em todas as etapas.</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
