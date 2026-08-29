import Link from 'next/link'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export default function NotFound() {
  return (
    <main className="not-found" id="conteudo">
      <div className="container not-found-inner">
        <p className="not-found-code" aria-hidden="true">404</p>
        <span className="eyebrow eyebrow-light">Página não encontrada</span>
        <h1>Esta página não está disponível.</h1>
        <p>Volte para a página inicial ou fale com a equipe FortSul para encontrar o que precisa.</p>
        <div className="not-found-actions">
          <Link className="button" href="/">Voltar para o início</Link>
          <WhatsAppTrigger className="text-link text-link-light" ariaLabel="Falar com a FortSul pelo WhatsApp">
            Falar com a FortSul <span aria-hidden="true">→</span>
          </WhatsAppTrigger>
        </div>
      </div>
    </main>
  )
}
