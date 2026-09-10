import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleTextForm } from './ArticleTextForm'

const push = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response
}

describe('ArticleTextForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    push.mockClear()
    refresh.mockClear()
  })

  it('cria um artigo novo (POST) e navega para a edição', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(201, { id: 'article-1', slug: 'novo-artigo' }))
    const user = userEvent.setup()
    render(<ArticleTextForm />)

    await user.type(screen.getByLabelText('Título'), 'Novo Artigo')
    await user.type(screen.getByLabelText('Corpo'), 'Corpo do artigo')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/articles',
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    )
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/articles/article-1'))
  })

  it('edita um artigo existente (PATCH) e atualiza a página', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { id: 'article-1' }))
    const user = userEvent.setup()
    render(
      <ArticleTextForm
        articleId="article-1"
        initialTitle="Título antigo"
        initialExcerpt="Resumo antigo"
        initialBody="Corpo antigo"
      />,
    )

    await user.clear(screen.getByLabelText('Título'))
    await user.type(screen.getByLabelText('Título'), 'Título novo')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/articles/article-1',
      expect.objectContaining({ method: 'PATCH', credentials: 'same-origin' }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(push).not.toHaveBeenCalled()
  })

  it('mostra a mensagem de erro retornada pela API sem navegar', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(500, { error: 'Não foi possível salvar o artigo.' }))
    const user = userEvent.setup()
    render(<ArticleTextForm />)

    await user.type(screen.getByLabelText('Título'), 'Título válido')
    await user.type(screen.getByLabelText('Corpo'), 'Corpo válido')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Não foi possível salvar o artigo.')
    expect(push).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })
})
