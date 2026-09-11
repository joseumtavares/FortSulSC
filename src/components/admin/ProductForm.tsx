'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CharCounter } from './CharCounter'
import {
  MAX_PRODUCT_CODE_LENGTH,
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_EYEBROW_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_WHATSAPP_MESSAGE_LENGTH,
} from '@/lib/content/text-limits'

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

type FieldName = 'code' | 'name' | 'eyebrow' | 'shortDescription' | 'catalogUrl' | 'description' | 'whatsappMessageTemplate'
type TextField = { name: FieldName; label: string; required: boolean; help?: string; type?: string; maxLength: number; textarea?: { rows: number } }

const textFields: TextField[] = [
  { name: 'code', label: 'Código', required: true, help: 'Identificador interno do produto, definido por você (ex.: ALM-001).', maxLength: MAX_PRODUCT_CODE_LENGTH },
  { name: 'name', label: 'Nome', required: true, maxLength: MAX_PRODUCT_NAME_LENGTH },
  { name: 'eyebrow', label: 'Selo/eyebrow (opcional)', required: false, maxLength: MAX_PRODUCT_EYEBROW_LENGTH },
  { name: 'shortDescription', label: 'Descrição curta (opcional)', required: false, maxLength: MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH },
  { name: 'catalogUrl', label: 'Link do catálogo em PDF (opcional)', required: false, type: 'url', maxLength: 2048 },
  { name: 'description', label: 'Descrição completa (opcional)', required: false, maxLength: MAX_PRODUCT_DESCRIPTION_LENGTH, textarea: { rows: 5 } },
  {
    name: 'whatsappMessageTemplate',
    label: 'Mensagem do botão "Saiba mais" no WhatsApp (opcional)',
    required: false,
    maxLength: MAX_PRODUCT_WHATSAPP_MESSAGE_LENGTH,
    textarea: { rows: 3 },
    help: 'Use {produto} para inserir o nome do produto automaticamente. Deixe em branco para usar a mensagem padrão.',
  },
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
  const [counts, setCounts] = useState<Record<FieldName, number>>(() => {
    const initialCounts = {} as Record<FieldName, number>
    for (const field of textFields) initialCounts[field.name] = (initial?.[field.name] ?? '').length
    return initialCounts
  })

  function handleCount(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = event.target.name as FieldName
    setCounts((current) => ({ ...current, [name]: event.target.value.length }))
  }

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
        {textFields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-brand-blue-950">
              {field.label}
              {field.textarea ? (
                <textarea
                  name={field.name}
                  rows={field.textarea.rows}
                  maxLength={field.maxLength}
                  defaultValue={initial?.[field.name] ?? ''}
                  onChange={handleCount}
                  className={inputClass}
                  aria-describedby={field.help ? `product-${field.name}-help` : undefined}
                />
              ) : (
                <input
                  name={field.name}
                  type={field.type ?? 'text'}
                  required={field.required}
                  maxLength={field.maxLength}
                  defaultValue={initial?.[field.name] ?? ''}
                  onChange={handleCount}
                  className={inputClass}
                  aria-describedby={field.help ? `product-${field.name}-help` : undefined}
                />
              )}
            </label>
            {field.help && <span id={`product-${field.name}-help`} className="mt-1 block text-xs text-brand-muted">{field.help}</span>}
            {field.name !== 'catalogUrl' && <CharCounter length={counts[field.name]} max={field.maxLength} />}
          </div>
        ))}
      </fieldset>
      <button disabled={saving} className="min-h-11 rounded-lg bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60">
        {saving ? 'Salvando…' : productId ? 'Salvar' : 'Criar produto'}
      </button>
    </form>
  )
}
