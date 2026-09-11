import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { IDLE_TIMEOUT_MS, IdleLogoutWatcher } from './IdleLogoutWatcher'

const push = vi.fn()
const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

describe('IdleLogoutWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as Response))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    push.mockClear()
    refresh.mockClear()
  })

  it('desloga após 15 minutos sem nenhuma interação', async () => {
    render(<IdleLogoutWatcher />)

    await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS)

    expect(fetch).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    expect(push).toHaveBeenCalledWith('/admin/login')
    expect(refresh).toHaveBeenCalled()
  })

  it('reinicia a contagem quando há interação antes do limite', async () => {
    render(<IdleLogoutWatcher />)

    await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS - 1000)
    window.dispatchEvent(new Event('keydown'))
    await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS - 1000)

    expect(fetch).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetch).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
  })

  it('desloga mesmo se a chamada ao servidor falhar', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('falha de rede'))
    render(<IdleLogoutWatcher />)

    await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS)

    expect(push).toHaveBeenCalledWith('/admin/login')
  })

  it('remove os listeners ao desmontar', async () => {
    const { unmount } = render(<IdleLogoutWatcher />)
    unmount()

    await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS)

    expect(fetch).not.toHaveBeenCalled()
  })
})
