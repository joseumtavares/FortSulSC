import { MAX_PARTNER_CONSENT_NOTES_LENGTH, MAX_PARTNER_DOCUMENT_LENGTH } from './text-limits'

export type PartnerPrivateInput = { document: string | null; consentNotes: string | null }

function optionalText(value: unknown, max: number, fieldLabel: string): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new Error('Campo de texto inválido.')
  const text = value.trim() || null
  if (text && text.length > max) throw new Error(`${fieldLabel} deve ter no máximo ${max} caracteres.`)
  return text
}

/**
 * `consentGivenAt` é sempre "agora", definido pelo servidor no momento em
 * que o admin registra o consentimento — nunca aceito do cliente, para não
 * permitir datar retroativamente uma prova de consentimento (LGPD).
 */
export function parsePartnerPrivateInput(value: unknown): PartnerPrivateInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>

  return {
    document: optionalText(body.document, MAX_PARTNER_DOCUMENT_LENGTH, 'Documento'),
    consentNotes: optionalText(body.consentNotes, MAX_PARTNER_CONSENT_NOTES_LENGTH, 'Observações de consentimento'),
  }
}
