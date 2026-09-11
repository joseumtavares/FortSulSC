'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type ProductValues = {
  code: string
  name: string
  eyebrow: string | null
  shortDescription: string | null
  description: string | null
  catalogUrl: string | null
  whatsappMessageTemplate: string | null
}
type Props = { productId?: string; initial?: ProductValues }
const inputClass = 'w-full rounded-lg border border-brand-line px-3 py-2 text-sm'

type TextField = { name: 'code' | 'name' | 'eyebrow' | 'shortDescription' | 'catalogUrl'; label: string; required: boolean; help?: string; type?: string }

const textFields: TextField[] = [
  { name: 'code', label: 'Código', required: true, help: 'Identificador interno do produto, definido por você (ex.: ALM-001).' },
  { name: 'name', label: 'Nome', required: true },
  { name: 'eyebrow', label: 'Selo/eyebrow (opcional)', required: false },
  { name: 'shortDescription', label: 'Descrição curta (opcional)', required: false },
  { name: 'catalogUrl', label: 'Link do catálogo em PDF (opcional)', required: false, type: 'url' },
]

async function saveProduct(productId: string | undefined, body: Record<string, unknown>) {
  const response = await fetch(productId ? `/api/admin/products/${productId}` : '/api/admin/products', {
    method: productId ? 'PATCH' : 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json()) as { id?: string; error?: string }
  return { ok: response.ok, data }
}

export function ProductForm({ productId, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget))
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const { ok, data } = await saveProduct(productId, body)
      if (!ok) { setError(data.error ?? 'Não foi possível salvar o produto.'); return }
      if (!productId && data.id) router.push(`/admin/products/${data.id}`)
      setSaved(true)
      router.refresh()
    } catch {
      setError('Não foi possível salvar. Confira sua conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Produto salvo.</p>}
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        {textFields.map(({ name, label, required, help, ...rest }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-brand-blue-950">
              {label}
              <input
                name={name}
                required={required}
                defaultValue={initial?.[name] ?? ''}
                className={inputClass}
                aria-describedby={help ? `product-${name}-help` : undefined}
                {...rest}
              />
            </label>
            {help && <span id={`product-${name}-help`} className="mt-1 block text-xs text-brand-muted">{help}</span>}
          </div>
        ))}
        <label className="block text-sm font-medium text-brand-blue-950">Descrição completa (opcional)
          <textarea name="description" rows={5} defaultValue={initial?.description ?? ''} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-brand-blue-950">Mensagem do botão &quot;Saiba mais&quot; no WhatsApp (opcional)
          <textarea name="whatsappMessageTemplate" rows={3} defaultValue={initial?.whatsappMessageTemplate ?? ''} className={inputClass} aria-describedby="product-whatsapp-help" />
        </label>
        <span id="product-whatsapp-help" className="-mt-3 block text-xs text-brand-muted">Use {'{produto}'} para inserir o nome do produto automaticamente. Deixe em branco para usar a mensagem padrão.</span>
      </fieldset>
      <button disabled={saving} className="min-h-11 rounded-lg bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60">
        {saving ? 'Salvando…' : productId ? 'Salvar' : 'Criar produto'}
      </button>
    </form>
  )
}
