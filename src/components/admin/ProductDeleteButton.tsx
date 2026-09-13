'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProductDeleteButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (!window.confirm('Excluir este produto e todo o seu conteúdo (imagens, especificações, depoimentos)? Essa ação não pode ser desfeita.')) return
    setDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE', credentials: 'same-origin' })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível excluir o produto. Tente novamente em instantes.'); return }
      router.push('/admin/products')
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setDeleting(false) }
  }

  return <div>
    <button
      type="button"
      disabled={deleting}
      onClick={() => { void handleDelete() }}
      className="min-h-11 rounded-lg border border-red-700 px-5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
    >
      {deleting ? 'Excluindo…' : 'Excluir produto'}
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>
}
