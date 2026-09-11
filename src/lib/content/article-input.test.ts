import { describe, expect, it } from 'vitest'
import { parseArticleInput } from './article-input'
import { MAX_ARTICLE_BODY_LENGTH, MAX_ARTICLE_EXCERPT_LENGTH, MAX_ARTICLE_TITLE_LENGTH } from './text-limits'

const valid = { title: ' Título de teste ', excerpt: ' Resumo curto ', body: ' Corpo do artigo. ' }

describe('parseArticleInput', () => {
  it('normalizes required and optional fields', () => {
    expect(parseArticleInput(valid)).toEqual({
      title: 'Título de teste',
      excerpt: 'Resumo curto',
      body: 'Corpo do artigo.',
    })
  })

  it('defaults excerpt to null when omitted', () => {
    expect(parseArticleInput({ title: valid.title, body: valid.body })).toEqual({
      title: 'Título de teste',
      excerpt: null,
      body: 'Corpo do artigo.',
    })
  })

  it.each([null, { ...valid, title: '' }, { ...valid, body: '' }])('rejects invalid input: %j', (input) => {
    expect(() => parseArticleInput(input)).toThrow()
  })

  it('rejects fields longer than their character limit', () => {
    expect(() => parseArticleInput({ ...valid, title: 'A'.repeat(MAX_ARTICLE_TITLE_LENGTH + 1) })).toThrow()
    expect(() => parseArticleInput({ ...valid, excerpt: 'A'.repeat(MAX_ARTICLE_EXCERPT_LENGTH + 1) })).toThrow()
    expect(() => parseArticleInput({ ...valid, body: 'A'.repeat(MAX_ARTICLE_BODY_LENGTH + 1) })).toThrow()
  })

  it('accepts fields at exactly the character limit', () => {
    expect(() => parseArticleInput({ ...valid, title: 'A'.repeat(MAX_ARTICLE_TITLE_LENGTH) })).not.toThrow()
  })
})
