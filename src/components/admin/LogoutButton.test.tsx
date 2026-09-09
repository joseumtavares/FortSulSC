import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogoutButton } from './LogoutButton'

const push = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    push.mockClear()
    refresh.mockClear()
  })

  it('chama a rota de logout e redireciona para o login', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)
    const user = userEvent.setup()
    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(fetch).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/login'))
    expect(refresh).toHaveBeenCalled()
  })

  it('redireciona para o login mesmo se a chamada de logout falhar', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('falha de rede'))
    const user = userEvent.setup()
    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/login'))
  })

  it('mostra estado de carregamento e desabilita o botão durante a chamada', async () => {
    let resolveFetch: (value: Response) => void = () => {}
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )
    const user = userEvent.setup()
    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(screen.getByRole('button', { name: 'Saindo…' })).toHaveProperty('disabled', true)
    resolveFetch({ ok: true } as Response)
    await waitFor(() => expect(push).toHaveBeenCalled())
  })
})
