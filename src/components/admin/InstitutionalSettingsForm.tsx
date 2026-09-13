'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { SocialLinks } from '@/lib/content/social-links'

type Settings = { whatsapp: string; email: string; phone: string | null; cnpj: string | null; address: string | null; socialLinks: SocialLinks | null }
const fields = [
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel', required: true },
  { name: 'phone', label: 'Telefone (opcional)', type: 'tel', required: false },
  { name: 'email', label: 'E-mail', type: 'email', required: true },
  { name: 'cnpj', label: 'CNPJ (opcional)', type: 'text', required: false },
  { name: 'address', label: 'Endereço (opcional)', type: 'text', required: false },
] as const
const networks = [{ name: 'facebook', label: 'Facebook' }, { name: 'instagram', label: 'Instagram' }, { name: 'linkedin', label: 'LinkedIn' }, { name: 'youtube', label: 'YouTube' }] as const
const inputClass = 'w-full rounded-lg border border-brand-line px-3 py-2 text-sm'

export function InstitutionalSettingsForm({ initial }: { initial?: Settings }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const socialLinks = Object.fromEntries(networks.map(({ name }) => [name, form.get(name)]).filter(([, value]) => value))
    const contact = Object.fromEntries(fields.map(({ name }) => [name, form.get(name)]))
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await fetch('/api/admin/institutional-settings', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...contact, socialLinks }) })
      const data = await response.json() as { error?: string }
      if (!response.ok) { setError(data.error ?? 'Não foi possível salvar as configurações. Tente novamente em instantes.'); return }
      setSaved(true)
      router.refresh()
    } catch { setError('Não foi possível salvar. Confira sua conexão e tente novamente.') } finally { setSaving(false) }
  }

  return <form onSubmit={submit} className="space-y-6 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {saved && <p role="status" className="text-sm text-green-800">Configurações salvas.</p>}
    <fieldset disabled={saving} className="min-w-0 space-y-4">
      <legend className="mb-4 font-semibold text-brand-blue-950">Contato institucional</legend>
      {fields.map(({ name, label, type, required }) => <label key={name} className="block text-sm font-medium text-brand-blue-950">{label}
        <input name={name} type={type} required={required} defaultValue={initial?.[name] ?? ''} className={inputClass} />
      </label>)}
    </fieldset>
    <fieldset disabled={saving} className="min-w-0 space-y-4">
      <legend className="font-semibold text-brand-blue-950">Redes sociais</legend>
      <p className="text-sm text-brand-muted">Links HTTPS opcionais. Deixe o campo vazio para remover o link.</p>
      {networks.map(({ name, label }) => <label key={name} className="block text-sm font-medium text-brand-blue-950">{label}
        <input name={name} type="url" defaultValue={initial?.socialLinks?.[name] ?? ''} className={inputClass} />
      </label>)}
    </fieldset>
    <button disabled={saving} className="min-h-11 rounded-lg bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60">{saving ? 'Salvando…' : 'Salvar configurações'}</button>
  </form>
}
