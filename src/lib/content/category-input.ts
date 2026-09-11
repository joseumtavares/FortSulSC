import { MAX_CATEGORY_NAME_LENGTH } from './text-limits'

export type CategoryTextInput = { name: string; slug: string; order: number }

export function parseCategoryInput(value: unknown): CategoryTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  if (!name) throw new Error('Nome obrigatório.')
  if (name.length > MAX_CATEGORY_NAME_LENGTH) throw new Error(`Nome deve ter no máximo ${MAX_CATEGORY_NAME_LENGTH} caracteres.`)
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error('Informe um slug válido (letras minúsculas, números e hífen).')
  const order = typeof body.order === 'number' && Number.isFinite(body.order) ? Math.trunc(body.order) : 0
  return { name, slug, order }
}
