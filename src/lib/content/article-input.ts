import { MAX_ARTICLE_BODY_LENGTH, MAX_ARTICLE_EXCERPT_LENGTH, MAX_ARTICLE_TITLE_LENGTH } from './text-limits'

export type ArticleTextInput = { title: string; excerpt: string | null; body: string }

function assertMaxLength(text: string, max: number, fieldLabel: string): void {
  if (text.length > max) throw new Error(`${fieldLabel} deve ter no máximo ${max} caracteres.`)
}

export function parseArticleInput(value: unknown): ArticleTextInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const articleBody = typeof body.body === 'string' ? body.body.trim() : ''

  if (!title) throw new Error('Título obrigatório.')
  if (!articleBody) throw new Error('Corpo do artigo obrigatório.')
  assertMaxLength(title, MAX_ARTICLE_TITLE_LENGTH, 'Título')
  assertMaxLength(excerpt, MAX_ARTICLE_EXCERPT_LENGTH, 'Resumo')
  assertMaxLength(articleBody, MAX_ARTICLE_BODY_LENGTH, 'Corpo do artigo')

  return { title, excerpt: excerpt || null, body: articleBody }
}
