import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))
import { PartnerForm } from './PartnerForm'

beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn()) })

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/Nome/), { target: { value: 'Fulano de Tal' } })
  fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '5548999990000' } })
}

function submitForm(buttonName: string) {
  const form = screen.getByRole('button', { name: buttonName }).closest('form')
  if (!form) throw new Error('Formulário não encontrado')
  fireEvent.submit(form)
}

it('creates a partner and redirects to its edit page', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 'p1' }), { status: 201 }))
  render(<PartnerForm />)
  fillRequiredFields()
  submitForm('Criar parceiro')
  await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/partners/p1'))
  const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)
  expect(body.locationLink).toBe('')
})

it('sends the pasted location link in the request body', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 'p1' }), { status: 201 }))
  render(<PartnerForm />)
  fillRequiredFields()
  fireEvent.change(screen.getByLabelText(/Link de localização/), { target: { value: 'https://maps.app.goo.gl/abc123' } })
  submitForm('Criar parceiro')
  await waitFor(() => expect(fetch).toHaveBeenCalled())
  const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)
  expect(body.locationLink).toBe('https://maps.app.goo.gl/abc123')
})

it('saves checked LGPD boxes as booleans to the private-data endpoint', async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'p1' }), { status: 201 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'p1' }), { status: 200 }))
  render(<PartnerForm />)
  fillRequiredFields()
  fireEvent.click(screen.getByText(/Documento físico assinado/))
  submitForm('Criar parceiro')

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    '/api/admin/partners/p1/private',
    expect.objectContaining({ method: 'PUT', body: JSON.stringify({ documentSigned: true, lgpdAuthorized: false }) }),
  )
})

it('does not call the private-data endpoint when nothing was checked and no private record exists', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ id: 'p1' }), { status: 201 }))
  render(<PartnerForm />)
  fillRequiredFields()
  submitForm('Criar parceiro')
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
})

it('pre-checks LGPD boxes when editing a partner with an existing declaration', () => {
  render(
    <PartnerForm
      partnerId="p1"
      initial={{
        type: 'REPRESENTATIVE',
        name: 'Fulano de Tal',
        description: null,
        whatsapp: '5548999990000',
        websiteUrl: null,
        approximateLat: null,
        approximateLng: null,
        socialLinks: null,
        private: { document: 'Documento físico assinado, arquivado na empresa.', consentNotes: null },
      }}
    />,
  )
  expect((screen.getByLabelText(/Documento físico assinado/) as HTMLInputElement).checked).toBe(true)
  expect((screen.getByLabelText(/autoriza a divulgação/) as HTMLInputElement).checked).toBe(false)
})

it('displays a connection error and re-enables the submit button', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('offline'))
  render(<PartnerForm />)
  fillRequiredFields()
  submitForm('Criar parceiro')
  expect(await screen.findByRole('alert')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Criar parceiro' }).hasAttribute('disabled')).toBe(false)
})
