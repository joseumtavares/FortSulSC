import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response
}

async function fillPasswordStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('E-mail'), 'admin@fortsul.com.br')
  await user.type(screen.getByLabelText('Senha'), 'segredo-forte')
  await user.click(screen.getByRole('button', { name: 'Entrar no painel' }))
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    push.mockClear()
  })

  it('avança para o passo de código quando a senha é aceita', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { step: 'code_sent' }))
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillPasswordStep(user)

    expect(await screen.findByLabelText('Código de verificação')).not.toBeNull()
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/login/password',
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    )
  })

  it('mostra mensagem genérica quando a senha é rejeitada com 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, { error: 'Credenciais inválidas ou conta temporariamente bloqueada.' }))
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillPasswordStep(user)

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Credenciais inválidas ou conta temporariamente bloqueada.',
    )
    expect(screen.queryByLabelText('Código de verificação')).toBeNull()
  })

  it('mostra a mesma mensagem genérica quando a senha é bloqueada com 429', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(429, { error: 'Credenciais inválidas ou conta temporariamente bloqueada.' }))
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillPasswordStep(user)

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Credenciais inválidas ou conta temporariamente bloqueada.',
    )
  })

  it('redireciona para a confirmação de sessão quando o código é aceito', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(200, { step: 'code_sent' }))
      .mockResolvedValueOnce(jsonResponse(200, { step: 'authenticated' }))
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillPasswordStep(user)
    await user.type(await screen.findByLabelText('Código de verificação'), '123456')
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/session-check'))
  })

  it('mostra "Código inválido ou expirado" em 401 e o texto de bloqueio em 429', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(200, { step: 'code_sent' }))
      .mockResolvedValueOnce(jsonResponse(401, { error: 'Código inválido ou expirado.' }))
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillPasswordStep(user)
    await user.type(await screen.findByLabelText('Código de verificação'), '000000')
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }))

    expect((await screen.findByRole('alert')).textContent).toBe('Código inválido ou expirado.')

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(429, { error: 'Muitas tentativas. Tente novamente mais tarde.' }))
    await user.clear(screen.getByLabelText('Código de verificação'))
    await user.type(screen.getByLabelText('Código de verificação'), '111111')
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }))

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Muitas tentativas. Tente novamente mais tarde.'),
    )
  })

  it('alterna a visibilidade da senha com nome acessível', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Senha')
    expect(passwordInput.getAttribute('type')).toBe('password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(passwordInput.getAttribute('type')).toBe('text')

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(passwordInput.getAttribute('type')).toBe('password')
  })

  it('mantém ordem de tabulação lógica entre e-mail, senha, alternância e envio', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.tab()
    expect(screen.getByLabelText('E-mail')).toBe(document.activeElement)
    await user.tab()
    expect(screen.getByLabelText('Senha')).toBe(document.activeElement)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Mostrar senha' })).toBe(document.activeElement)
    await user.tab()
    expect(screen.getByRole('button', { name: 'Entrar no painel' })).toBe(document.activeElement)
  })
})
