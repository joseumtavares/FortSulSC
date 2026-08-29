import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'

export default function Home() {
  return (
    <main id="conteudo">
      <h1>FortSul — fundação Next.js</h1>
      <p>
        Fatia 2 da Tarefa 3: cabeçalho e rodapé migrados. As demais seções chegam nas próximas
        fatias.
      </p>
      <WhatsAppTrigger className="button" ariaLabel="Testar abertura do diálogo do WhatsApp">
        Testar diálogo do WhatsApp
      </WhatsAppTrigger>
    </main>
  )
}
