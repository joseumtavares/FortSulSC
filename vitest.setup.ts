import { config } from 'dotenv'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// `vitest run src/lib/db` não carrega nenhum arquivo de variáveis sozinho
// (diferente de `next dev`/`next build`, que carregam `.env.local`/`.env`
// automaticamente). Sem isto, os testes de integração falham com
// "Environment variable not found: DATABASE_URL" mesmo com o arquivo
// preenchido corretamente. Mesma ordem de prioridade do Next.js: `.env.local`
// vence `.env` quando a mesma chave existe nos dois.
config({ path: ['.env.local', '.env'] })

// Sem globals do Vitest habilitado, o auto-cleanup do Testing Library não se
// registra sozinho — sem isto, o DOM de um teste vaza para o próximo.
afterEach(() => {
  cleanup()
})

// jsdom não implementa HTMLDialogElement.showModal()/close(); os testes do
// WhatsAppDialog dependem desse polyfill mínimo, fiel ao comportamento real:
// showModal() marca open=true e close() marca open=false e dispara "close".
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
