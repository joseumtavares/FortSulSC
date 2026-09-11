'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProductActiveToggle({ productId, initialActive }: { productId: string; initialActive: boolean }) {
  const router = useRouter()
  const [active, setActive] = useState(initialActive)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function change(checked: boolean) {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/products/${productId}/${checked ? 'activate' : 'deactivate'}`, { method: 'POST', credentials: 'same-origin' })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível alterar o produto.'); return }
      setActive(checked)
      router.refresh()
    } catch { setError('Falha de conexão. Tente novamente.') } finally { setSaving(false) }
  }
  return <div>
    <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-blue-950">
      <input type="checkbox" checked={active} disabled={saving} onChange={(event) => { void change(event.target.checked) }} className="h-4 w-4 accent-brand-orange" />
      Ativo
    </label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>
}
