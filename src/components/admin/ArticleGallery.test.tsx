import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleGallery } from './ArticleGallery'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}))

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response
}

describe('ArticleGallery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    refresh.mockClear()
  })

  it('rejeita o envio sem selecionar arquivo', async () => {
    const user = userEvent.setup()
    render(<ArticleGallery articleId="article-1" images={[]} maxImages={4} />)

    await user.click(screen.getByRole('button', { name: 'Adicionar imagem' }))

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Selecione um arquivo de imagem.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia a nova imagem como multipart/form-data e atualiza a lista', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(201, { id: 'image-2', imageUrl: 'https://images.test/b.jpg', altText: 'Segunda foto' }),
    )
    const user = userEvent.setup()
    render(<ArticleGallery articleId="article-1" images={[]} maxImages={4} />)

    const file = new File([new Uint8Array([1, 2, 3])], 'foto.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/Nova imagem/), file)
    await user.type(screen.getByLabelText('Texto alternativo'), 'Segunda foto')
    await user.click(screen.getByRole('button', { name: 'Adicionar imagem' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    const [url, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/articles/article-1/images')
    expect(options.method).toBe('POST')
    const formData = options.body as FormData
    expect(formData.get('file')).toBe(file)
    expect(formData.get('alt')).toBe('Segunda foto')

    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('mostra a mensagem de erro retornada pela API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(400, { error: 'Arquivo maior que 5 MB.' }))
    const user = userEvent.setup()
    render(<ArticleGallery articleId="article-1" images={[]} maxImages={4} />)

    const file = new File([new Uint8Array([1])], 'foto.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/Nova imagem/), file)
    await user.click(screen.getByRole('button', { name: 'Adicionar imagem' }))

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Arquivo maior que 5 MB.')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('esconde o formulário de envio e mostra o aviso de limite quando atingido', () => {
    const images = Array.from({ length: 4 }, (_, index) => ({
      id: `image-${index}`,
      imageUrl: `https://images.test/${index}.jpg`,
      altText: `Foto ${index}`,
    }))
    render(<ArticleGallery articleId="article-1" images={images} maxImages={4} />)

    expect(screen.queryByLabelText(/Nova imagem/)).toBeNull()
    expect(screen.getByText(/Limite de 4 imagens atingido/)).toBeTruthy()
  })

  it('remove uma imagem existente e atualiza a lista', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { id: 'image-1' }))
    const user = userEvent.setup()
    render(
      <ArticleGallery
        articleId="article-1"
        images={[{ id: 'image-1', imageUrl: 'https://images.test/a.jpg', altText: 'Foto A' }]}
        maxImages={4}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remover imagem: Foto A' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/admin/articles/article-1/images/image-1', {
      method: 'DELETE',
      credentials: 'same-origin',
    }))
    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })
})
