import { MAX_COMMERCIAL_AREA_NAME_LENGTH } from './text-limits'

export type CommercialAreaTextInput = { name: string }

export function parseCommercialAreaInput(value: unknown): CommercialAreaTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) throw new Error('Nome obrigatório.')
  if (name.length > MAX_COMMERCIAL_AREA_NAME_LENGTH) {
    throw new Error(`Nome deve ter no máximo ${MAX_COMMERCIAL_AREA_NAME_LENGTH} caracteres.`)
  }
  return { name }
}
