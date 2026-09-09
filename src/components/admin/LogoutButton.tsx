'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    } catch {
      // A sessão local é encerrada mesmo se a chamada ao servidor falhar —
      // o próximo carregamento de /admin exige login de qualquer forma.
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-line bg-white px-4 text-sm font-semibold text-brand-blue-950 transition-colors hover:bg-brand-surface disabled:opacity-60"
    >
      {isLoading ? 'Saindo…' : 'Sair'}
    </button>
  )
}
