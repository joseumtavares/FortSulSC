'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const IDLE_TIMEOUT_MS = 15 * 60 * 1000

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const

/**
 * Desloga automaticamente o admin após 15 min sem interação no painel —
 * achado de segurança do Jose: sessão de 8h (agora 2h, ver auth/config.ts)
 * ficava aberta indefinidamente se a aba fosse só esquecida, sem ninguém
 * usar o painel. Reaproveita a mesma rota de logout do `LogoutButton`.
 */
export function IdleLogoutWatcher() {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function logout() {
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

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS)
    }

    resetTimer()
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, resetTimer))
    }
  }, [router])

  return null
}
