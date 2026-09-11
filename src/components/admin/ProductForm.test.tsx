import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))
import { ProductForm } from './ProductForm'
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()) })

it('creates a product and redirects to its edit page', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 'p1' }), { status: 201 }))
  render(<ProductForm />)
  fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'ALM-001' } })
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Alimentador' } })
  const createForm = screen.getByRole('button', { name: 'Criar produto' }).closest('form')
  if (!createForm) throw new Error('Formulário de criação não encontrado')
  fireEvent.submit(createForm)
  await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/products/p1'))
  expect(fetch).toHaveBeenCalledWith('/api/admin/products', expect.objectContaining({ method: 'POST' }))
})

it('displays a connection error and allows retry', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('offline'))
  render(
    <ProductForm
      productId="p1"
      initial={{ code: 'ALM-001', name: 'Alimentador', eyebrow: null, shortDescription: null, description: null, catalogUrl: null, whatsappMessageTemplate: null }}
    />,
  )
  const editForm = screen.getByRole('button', { name: 'Salvar' }).closest('form')
  if (!editForm) throw new Error('Formulário de edição não encontrado')
  fireEvent.submit(editForm)
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Salvar' }).hasAttribute('disabled')).toBe(false)
})
