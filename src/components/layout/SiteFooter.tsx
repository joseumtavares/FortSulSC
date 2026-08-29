import Image from 'next/image'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#inicio">
            <Image
              src="/image/cropped-Logo.webp"
              width={301}
              height={67}
              alt="FortSul Equipamentos Agrícolas"
              loading="lazy"
            />
          </a>
          <p>Tecnologia para uma produção ainda mais eficiente.</p>
        </div>
        <div>
          <h3>Endereço</h3>
          <p>
            Estrada Geral Furninhas — Interior
            <br />
            Orleans — SC, 88870-000
          </p>
        </div>
        <div>
          <h3>Contato</h3>
          <a href="tel:+554836600818">(48) 3660-0818</a>
          <WhatsAppTrigger className="whatsapp-trigger" ariaLabel="Atendimento via WhatsApp">
            Atendimento via WhatsApp
          </WhatsAppTrigger>
        </div>
        <div>
          <h3>Redes sociais</h3>
          <a href="https://www.instagram.com/fortsulsc.ols/" target="_blank" rel="noopener noreferrer">
            Instagram ↗
          </a>
          <a href="https://www.facebook.com/fortsulsc.ols" target="_blank" rel="noopener noreferrer">
            Facebook ↗
          </a>
          <a
            href="https://www.youtube.com/channel/UCWdoH4BuVLX--mdu_598MXA"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube ↗
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 FortSulSC. Todos os direitos reservados.</span>
        <a href="#inicio">Voltar ao topo ↑</a>
      </div>
    </footer>
  )
}
