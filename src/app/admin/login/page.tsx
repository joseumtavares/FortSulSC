import type { Metadata } from 'next'
import Image from 'next/image'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Login administrativo | FortSul',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main id="conteudo" className="admin-login">
      <div className="admin-login-institutional" aria-hidden="true">
        <Image
          src="/image/cropped-Logo.webp"
          width={301}
          height={67}
          alt=""
          className="admin-login-institutional-logo"
        />
        <p>Painel administrativo FortSul Equipamentos Agrícolas.</p>
      </div>

      <div className="admin-login-card">
        <Image
          src="/image/cropped-Logo.webp"
          width={301}
          height={67}
          alt="FortSul Equipamentos Agrícolas"
          className="admin-login-logo"
          priority
        />
        <h1>Acesso administrativo</h1>
        <p className="admin-login-subtitle">Entre com seu e-mail e senha para receber o código de verificação.</p>
        <LoginForm />
      </div>
    </main>
  )
}
