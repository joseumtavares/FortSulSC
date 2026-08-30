import Image from 'next/image'
import { Reveal } from '@/components/ui/Reveal'

export function AboutSection() {
  return (
    <section className="section about" id="empresa" aria-labelledby="about-title">
      <div className="container about-grid">
        <Reveal className="about-visual">
          <div className="about-image">
            <Image
              src="/image/alimentador-reto.webp"
              alt="Alimentador FortSul em destaque"
              width={1448}
              height={1086}
              sizes="(max-width: 820px) 100vw, 48vw"
            />
          </div>
          <div className="about-seal">
            <Image
              src="/image/selo_qualidade_fortsul.webp"
              alt="Selo de qualidade garantida FortSul"
              width={1280}
              height={1280}
              sizes="(max-width: 560px) 112px, 150px"
            />
          </div>
        </Reveal>

        <Reveal delay className="about-copy">
          <span className="eyebrow">Sobre a FortSul</span>
          <h2 id="about-title">
            Tecnologia robusta.<br />Relações duradouras.
          </h2>
          <p className="lead">
            A FortSul une conhecimento de campo, fabricação responsável e atendimento próximo para
            criar equipamentos que fazem sentido na operação de cada cliente.
          </p>
          <div className="feature-list">
            <div>
              <span className="feature-icon">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-6h6v6" />
                </svg>
              </span>
              <div>
                <strong>Produção própria</strong>
                <p>Controle e atenção em cada etapa de fabricação.</p>
              </div>
            </div>
            <div>
              <span className="feature-icon">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 12l3 3 5-6" />
                </svg>
              </span>
              <div>
                <strong>Solução completa</strong>
                <p>Instalação, suporte, assistência e pós-venda.</p>
              </div>
            </div>
          </div>
          <a className="text-link" href="#atendimento">
            Conheça nosso jeito de trabalhar <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
