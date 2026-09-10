import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticlePublishToggle } from './ArticlePublishToggle'

const push = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response
}

describe('ArticlePublishToggle', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    refresh.mockClear()
  })

  it('chama publish ao marcar a caixa quando o artigo está em rascunho', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { status: 'PUBLISHED' }))
    const user = userEvent.setup()
    render(<ArticlePublishToggle articleId="article-1" initialPublished={false} />)

    await user.click(screen.getByRole('checkbox', { name: 'Publicado' }))

    expect(fetch).toHaveBeenCalledWith('/api/admin/articles/article-1/publish', {
      method: 'POST',
      credentials: 'same-origin',
    })
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(screen.getByRole('checkbox', { name: 'Publicado' })).toHaveProperty('checked', true)
  })

  it('chama unpublish ao desmarcar a caixa quando o artigo está publicado', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { status: 'DRAFT' }))
    const user = userEvent.setup()
    render(<ArticlePublishToggle articleId="article-1" initialPublished />)

    await user.click(screen.getByRole('checkbox', { name: 'Publicado' }))

    expect(fetch).toHaveBeenCalledWith('/api/admin/articles/article-1/unpublish', {
      method: 'POST',
      credentials: 'same-origin',
    })
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(screen.getByRole('checkbox', { name: 'Publicado' })).toHaveProperty('checked', false)
  })

  it('mostra erro e mantém o estado anterior quando a API rejeita a publicação', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(400, { error: 'Artigo precisa de imagem de capa e texto alternativo para ser publicado' }),
    )
    const user = userEvent.setup()
    render(<ArticlePublishToggle articleId="article-1" initialPublished={false} />)

    await user.click(screen.getByRole('checkbox', { name: 'Publicado' }))

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Artigo precisa de imagem de capa e texto alternativo para ser publicado',
    )
    expect(screen.getByRole('checkbox', { name: 'Publicado' })).toHaveProperty('checked', false)
    expect(refresh).not.toHaveBeenCalled()
  })
})
