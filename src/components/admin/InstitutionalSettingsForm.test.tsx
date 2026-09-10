import { expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
import { InstitutionalSettingsForm } from './InstitutionalSettingsForm'
it('saves contact data and removes empty social links', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'settings-1' })))
  vi.stubGlobal('fetch', fetchMock)
  render(<InstitutionalSettingsForm />)
  fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '48999990000' } })
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'test@example.com' } })
  const settingsForm = screen.getByRole('button', { name: 'Salvar configurações' }).closest('form')
  if (!settingsForm) throw new Error('Formulário de configurações não encontrado')
  fireEvent.submit(settingsForm)
  await waitFor(() => expect(fetchMock).toHaveBeenCalled())
  const payload = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string) as { socialLinks: unknown }
  expect(payload.socialLinks).toEqual({})
  expect(await screen.findByRole('status')).toBeTruthy()
})
