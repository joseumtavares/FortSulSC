'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CountedField } from './CountedField'
import type { SocialLinks } from '@/lib/content/social-links'
import {
  MAX_PARTNER_CONSENT_NOTES_LENGTH,
  MAX_PARTNER_DESCRIPTION_LENGTH,
  MAX_PARTNER_DOCUMENT_LENGTH,
  MAX_PARTNER_NAME_LENGTH,
} from '@/lib/content/text-limits'

type PartnerValues = {
  type: 'REPRESENTATIVE' | 'RESELLER'
  name: string
  description: string | null
  whatsapp: string
  websiteUrl: string | null
  approximateLat: number | null
  approximateLng: number | null
  socialLinks: SocialLinks | null
  private: { document: string | null; consentNotes: string | null } | null
}

type Props = { partnerId?: string; initial?: PartnerValues; defaultType?: 'REPRESENTATIVE' | 'RESELLER' }
const inputClass = 'w-full rounded-lg border border-brand-line px-3 py-2 text-sm'
const networks = [{ name: 'facebook', label: 'Facebook' }, { name: 'instagram', label: 'Instagram' }, { name: 'linkedin', label: 'LinkedIn' }, { name: 'youtube', label: 'YouTube' }] as const

async function savePartnerPrivate(partnerId: string, document: string, consentNotes: string) {
  const response = await fetch(`/api/admin/partners/${partnerId}/private`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document, consentNotes }),
  })
  const data = (await response.json()) as { error?: string }
  return { ok: response.ok, data }
}

async function savePartner(partnerId: string | undefined, body: Record<string, unknown>) {
  const response = await fetch(partnerId ? `/api/admin/partners/${partnerId}` : '/api/admin/partners', {
    method: partnerId ? 'PATCH' : 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json()) as { id?: string; error?: string }
  return { ok: response.ok, data }
}

function buildPartnerBody(form: FormData) {
  const socialLinks = Object.fromEntries(networks.map(({ name }) => [name, form.get(name)]).filter(([, value]) => value))
  return {
    type: form.get('type'),
    name: form.get('name'),
    description: form.get('description'),
    whatsapp: form.get('whatsapp'),
    websiteUrl: form.get('websiteUrl'),
    approximateLat: form.get('approximateLat'),
    approximateLng: form.get('approximateLng'),
    socialLinks,
  }
}

function withPartnerIdentityDefaults(initial: PartnerValues | undefined, defaultType: 'REPRESENTATIVE' | 'RESELLER' | undefined) {
  return {
    type: initial?.type ?? defaultType ?? 'REPRESENTATIVE',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
  }
}

function withPartnerContactDefaults(initial: PartnerValues | undefined) {
  return {
    whatsapp: initial?.whatsapp ?? '',
    websiteUrl: initial?.websiteUrl ?? '',
    approximateLat: initial?.approximateLat ?? '',
    approximateLng: initial?.approximateLng ?? '',
  }
}

function withPartnerFieldDefaults(initial: PartnerValues | undefined, defaultType: 'REPRESENTATIVE' | 'RESELLER' | undefined) {
  return { ...withPartnerIdentityDefaults(initial, defaultType), ...withPartnerContactDefaults(initial) }
}

function withPartnerPrivateDefaults(initial: PartnerValues | undefined) {
  return {
    socialLinks: initial?.socialLinks ?? {},
    document: initial?.private?.document ?? '',
    consentNotes: initial?.private?.consentNotes ?? '',
  }
}

function withPartnerDefaults(initial: PartnerValues | undefined, defaultType: 'REPRESENTATIVE' | 'RESELLER' | undefined) {
  return { ...withPartnerFieldDefaults(initial, defaultType), ...withPartnerPrivateDefaults(initial) }
}

async function savePartnerAndPrivate(partnerId: string | undefined, form: FormData, hasExistingPrivate: boolean) {
  const document = String(form.get('document') ?? '').trim()
  const consentNotes = String(form.get('consentNotes') ?? '').trim()

  const { ok, data } = await savePartner(partnerId, buildPartnerBody(form))
  if (!ok) return { ok: false, error: data.error ?? 'Não foi possível salvar o parceiro.' }

  const id = partnerId ?? data.id
  if (id && (document || consentNotes || hasExistingPrivate)) {
    const privateResult = await savePartnerPrivate(id, document, consentNotes)
    if (!privateResult.ok) return { ok: false, error: privateResult.data.error ?? 'Não foi possível salvar os dados privados.' }
  }

  return { ok: true, id: data.id }
}

export function PartnerForm({ partnerId, initial, defaultType }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const defaults = withPartnerDefaults(initial, defaultType)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const result = await savePartnerAndPrivate(partnerId, form, Boolean(initial?.private))
      if (!result.ok) { setError(result.error ?? 'Não foi possível salvar o parceiro.'); return }
      if (!partnerId && result.id) router.push(`/admin/partners/${result.id}`)
      setSaved(true)
      router.refresh()
    } catch {
      setError('Não foi possível salvar. Confira sua conexão e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-brand border border-brand-line bg-white p-6 shadow-sm">
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-green-800">Parceiro salvo.</p>}

      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <legend className="mb-2 font-semibold text-brand-blue-950">Dados do parceiro</legend>
        <label className="block text-sm font-medium text-brand-blue-950">Tipo
          <select name="type" required defaultValue={defaults.type} className={inputClass}>
            <option value="REPRESENTATIVE">Representante</option>
            <option value="RESELLER">Revenda</option>
          </select>
        </label>
        <CountedField name="name" label="Nome" required maxLength={MAX_PARTNER_NAME_LENGTH} defaultValue={defaults.name} />
        <CountedField name="description" label="Descrição (opcional)" type="textarea" rows={4} maxLength={MAX_PARTNER_DESCRIPTION_LENGTH} defaultValue={defaults.description} />
        <label className="block text-sm font-medium text-brand-blue-950">WhatsApp
          <input name="whatsapp" type="tel" required defaultValue={defaults.whatsapp} className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-brand-blue-950">Site (opcional)
          <input name="websiteUrl" type="url" defaultValue={defaults.websiteUrl} className={inputClass} />
        </label>
      </fieldset>

      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <legend className="mb-2 font-semibold text-brand-blue-950">Localização aproximada (opcional)</legend>
        <p className="text-sm text-brand-muted">Coordenadas são sempre arredondadas para ~1km de precisão ao salvar, para preservar a privacidade de representantes pessoa física.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-brand-blue-950">Latitude
            <input name="approximateLat" type="number" step="any" min={-90} max={90} defaultValue={defaults.approximateLat} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-brand-blue-950">Longitude
            <input name="approximateLng" type="number" step="any" min={-180} max={180} defaultValue={defaults.approximateLng} className={inputClass} />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={saving} className="min-w-0 space-y-4">
        <legend className="font-semibold text-brand-blue-950">Redes sociais</legend>
        <p className="text-sm text-brand-muted">Links HTTPS opcionais. Deixe o campo vazio para remover o link.</p>
        {networks.map(({ name, label }) => (
          <label key={name} className="block text-sm font-medium text-brand-blue-950">{label}
            <input name={name} type="url" defaultValue={defaults.socialLinks[name] ?? ''} className={inputClass} />
          </label>
        ))}
      </fieldset>

      <fieldset disabled={saving} className="min-w-0 space-y-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <legend className="font-semibold text-amber-900">Dados privados (LGPD)</legend>
        <p className="text-sm text-amber-800">Documento e observações de consentimento — nunca aparecem em nenhuma consulta pública. Deixe em branco se não se aplicar.</p>
        <CountedField name="document" label="Documento (opcional)" maxLength={MAX_PARTNER_DOCUMENT_LENGTH} defaultValue={defaults.document} />
        <CountedField name="consentNotes" label="Observações de consentimento (opcional)" type="textarea" rows={2} maxLength={MAX_PARTNER_CONSENT_NOTES_LENGTH} defaultValue={defaults.consentNotes} />
      </fieldset>

      <button disabled={saving} className="min-h-11 rounded-lg bg-brand-orange px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60">
        {saving ? 'Salvando…' : (partnerId ? 'Salvar' : 'Criar parceiro')}
      </button>
    </form>
  )
}
