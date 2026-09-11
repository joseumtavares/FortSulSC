import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))
import { CategoryForm } from './CategoryForm'
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()) })

it('creates a category and redirects to its edit page', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 'cat-1' }), { status: 201 }))
  render(<CategoryForm />)
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Aviário' } })
  fireEvent.change(screen.getByLabelText('Slug'), { target: { value: 'aviario' } })
  const createForm = screen.getByRole('button', { name: 'Criar categoria' }).closest('form')
  if (!createForm) throw new Error('Formulário de criação não encontrado')
  fireEvent.submit(createForm)
  await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/categories/cat-1'))
  expect(fetch).toHaveBeenCalledWith('/api/admin/categories', expect.objectContaining({ method: 'POST' }))
})

it('displays a connection error and allows retry', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('offline'))
  render(<CategoryForm categoryId="cat-1" initial={{ name: 'Aviário', slug: 'aviario', order: 0 }} />)
  const editForm = screen.getByRole('button', { name: 'Salvar' }).closest('form')
  if (!editForm) throw new Error('Formulário de edição não encontrado')
  fireEvent.submit(editForm)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Salvar' }).hasAttribute('disabled')).toBe(false)
})
