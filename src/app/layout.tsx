import type { Metadata, Viewport } from 'next'
import { SiteChrome } from '@/components/layout/SiteChrome'
import './globals.css'

export const metadata: Metadata = {
  title: 'FortSul | Equipamentos Agrícolas',
  description:
    'FortSul Equipamentos Agrícolas — tecnologia, instalação e suporte para uma produção mais eficiente.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a3478',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
