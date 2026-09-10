import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArticleCoverUploadForm } from './ArticleCoverUploadForm'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}))

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response
}

describe('ArticleCoverUploadForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    refresh.mockClear()
  })

  it('rejeita o envio sem selecionar arquivo', async () => {
    const user = userEvent.setup()
    render(<ArticleCoverUploadForm articleId="article-1" />)

    await user.click(screen.getByRole('button', { name: 'Enviar capa' }))

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Selecione um arquivo de imagem.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia o arquivo e o texto alternativo como multipart/form-data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(200, { coverImageUrl: 'https://images.fortsulsc.test/x.jpg', coverImageAlt: 'Capa' }),
    )
    const user = userEvent.setup()
    render(<ArticleCoverUploadForm articleId="article-1" />)

    const file = new File([new Uint8Array([1, 2, 3])], 'capa.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/Arquivo/), file)
    await user.type(screen.getByLabelText('Texto alternativo'), 'Capa do artigo')
    await user.click(screen.getByRole('button', { name: 'Enviar capa' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    const [url, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/articles/article-1/cover')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    const formData = options.body as FormData
    expect(formData.get('file')).toBe(file)
    expect(formData.get('alt')).toBe('Capa do artigo')

    await waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('mostra a mensagem de erro retornada pela API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(400, { error: 'Arquivo maior que 5 MB.' }))
    const user = userEvent.setup()
    render(<ArticleCoverUploadForm articleId="article-1" />)

    const file = new File([new Uint8Array([1])], 'capa.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText(/Arquivo/), file)
    await user.click(screen.getByRole('button', { name: 'Enviar capa' }))

    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Arquivo maior que 5 MB.')
    expect(refresh).not.toHaveBeenCalled()
  })
})
