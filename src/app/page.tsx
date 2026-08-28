import { WhatsAppProvider } from '@/components/whatsapp/WhatsAppProvider'
import { WhatsAppTrigger } from '@/components/whatsapp/WhatsAppTrigger'
import { FloatingWhatsApp } from '@/components/whatsapp/FloatingWhatsApp'

export default function Home() {
  return (
    <WhatsAppProvider>
      <main>
        <h1>FortSul — fundação Next.js</h1>
        <p>
          Fatia 1 da Tarefa 3 (migração visual da home): primitiva de WhatsApp (diálogo, provider,
          gatilho, botão flutuante). As demais seções chegam nas próximas fatias.
        </p>
        <WhatsAppTrigger className="button" ariaLabel="Testar abertura do diálogo do WhatsApp">
          Testar diálogo do WhatsApp
        </WhatsAppTrigger>
      </main>
      <FloatingWhatsApp />
    </WhatsAppProvider>
  )
}
