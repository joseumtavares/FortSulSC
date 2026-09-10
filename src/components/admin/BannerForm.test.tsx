import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))
import { BannerForm } from './BannerForm'
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()) })
it('creates a banner with its image in one multipart request', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 'banner-1' }), { status: 201 }))
  render(<BannerForm />)
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Banner' } })
  fireEvent.change(screen.getByLabelText('Texto alternativo'), { target: { value: 'Imagem' } })
  fireEvent.change(screen.getByLabelText('Imagem'), { target: { files: [new File(['image'], 'banner.webp', { type: 'image/webp' })] } })
  const createForm = screen.getByRole('button', { name: 'Criar banner' }).closest('form')
  if (!createForm) throw new Error('Formulário de criação não encontrado')
  fireEvent.submit(createForm)
  await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/banners/banner-1'))
  expect(fetch).toHaveBeenCalledWith('/api/admin/banners', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }))
})
it('displays a connection error and allows retry', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('offline'))
  render(<BannerForm bannerId="banner-1" initial={{ title: 'Banner', altText: 'Imagem', linkUrl: null, startAt: null, endAt: null }} />)
  const editForm = screen.getByRole('button', { name: 'Salvar' }).closest('form')
  if (!editForm) throw new Error('Formulário de edição não encontrado')
  fireEvent.submit(editForm)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Salvar' }).hasAttribute('disabled')).toBe(false)
})
