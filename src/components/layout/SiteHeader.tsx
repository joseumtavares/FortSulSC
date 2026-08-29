import Image from 'next/image'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'
import { MobileMenu } from './MobileMenu'
import { NavWrap } from './NavWrap'

export function SiteHeader() {
  return (
    <header className="site-header" id="inicio">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>Orleans, Santa Catarina</span>
          <div>
            <a href="tel:+554836600818">(48) 3660-0818</a>
            <span className="utility-divider" aria-hidden="true" />
            <a href="#contato">Atendimento e orçamento</a>
          </div>
        </div>
      </div>

      <NavWrap>
        <div className="container nav-inner">
          <a className="brand" href="/" aria-label="FortSul — início">
            <Image
              src="/image/cropped-Logo.webp"
              width={301}
              height={67}
              alt="FortSul Equipamentos Agrícolas"
              priority
            />
          </a>
          <MobileMenu>
            <a href="#empresa">A FortSul</a>
            <a href="#solucoes">Soluções</a>
            <a href="#atendimento">Atendimento</a>
            <a href="#presenca">Representantes</a>
            <a href="#novidades-e-dicas">Novidades e dicas</a>
          </MobileMenu>
          <WhatsAppTrigger className="button button-sm nav-cta" ariaLabel="Solicitar orçamento por WhatsApp">
            Solicitar orçamento
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </WhatsAppTrigger>
        </div>
      </NavWrap>
    </header>
  )
}
