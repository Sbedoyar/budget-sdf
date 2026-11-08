// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFetch } from './useFetch'

afterEach(cleanup)

function deferred() {
  let resolve
  let reject
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

async function resolveRequest(request, data) {
  await act(async () => {
    request.resolve(data)
  })
}

async function rejectRequest(request, error) {
  await act(async () => {
    request.reject(error)
  })
}

describe('useFetch', () => {
  it('carga al montar, indica la espera inicial y guarda los datos recibidos', async () => {
    const request = deferred()
    const loadData = vi.fn(() => request.promise)
    const { result } = renderHook(() => useFetch(loadData, { initialData: [] }))

    expect(result.current).toMatchObject({ data: [], loading: true, refreshing: false, error: '' })
    await act(async () => {})
    expect(loadData).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBe(true)

    await resolveRequest(request, ['Arroz'])

    expect(result.current).toMatchObject({
      data: ['Arroz'], loading: false, refreshing: false, error: '',
    })
  })

  it('recarga sin ocultar los datos anteriores y actualiza al recibir la respuesta', async () => {
    const refresh = deferred()
    const loadData = vi.fn().mockResolvedValueOnce(['Arroz']).mockReturnValueOnce(refresh.promise)
    const { result } = renderHook(() => useFetch(loadData))
    await act(async () => {})

    act(() => { void result.current.refetch() })

    expect(loadData).toHaveBeenCalledTimes(2)
    expect(result.current).toMatchObject({ data: ['Arroz'], loading: false, refreshing: true })

    await resolveRequest(refresh, ['Café'])
    expect(result.current).toMatchObject({ data: ['Café'], loading: false, refreshing: false })
  })

  it('muestra el error HTTP y lo limpia al iniciar una nueva solicitud', async () => {
    const initial = deferred()
    const refresh = deferred()
    const loadData = vi.fn().mockReturnValueOnce(initial.promise).mockReturnValueOnce(refresh.promise)
    const { result } = renderHook(() => useFetch(loadData))

    await rejectRequest(initial, { response: { data: { message: 'Acceso denegado' } } })
    expect(result.current).toMatchObject({ error: 'Acceso denegado', loading: false })

    act(() => { void result.current.refetch() })
    expect(result.current).toMatchObject({ error: '', refreshing: true })

    await resolveRequest(refresh, [])
    expect(result.current).toMatchObject({ error: '', refreshing: false })
  })

  it('muestra el mensaje de conexión en español cuando falla la red', async () => {
    const loadData = vi.fn().mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    const { result } = renderHook(() => useFetch(loadData))
    await act(async () => {})

    expect(result.current.error).toBe(
      'No fue posible conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.',
    )
    expect(result.current.loading).toBe(false)
  })

  it('conserva los datos de la solicitud más reciente si la anterior termina después', async () => {
    const older = deferred()
    const newer = deferred()
    const loadData = vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise)
    const { result } = renderHook(() => useFetch(loadData))
    await act(async () => {})

    act(() => { void result.current.refetch() })
    await resolveRequest(newer, ['Nuevo'])
    await resolveRequest(older, ['Anterior'])

    expect(result.current).toMatchObject({ data: ['Nuevo'], loading: false, refreshing: false })
  })

  it('ignora un error pendiente después del desmontaje y no permite recargar', async () => {
    const request = deferred()
    const loadData = vi.fn(() => request.promise)
    const { result, unmount } = renderHook(() => useFetch(loadData))
    await act(async () => {})
    const { refetch } = result.current
    const readResponse = vi.fn()

    unmount()
    await rejectRequest(request, { get response() { return readResponse() } })
    await refetch()

    expect(readResponse).not.toHaveBeenCalled()
    expect(loadData).toHaveBeenCalledTimes(1)
  })

  it('ejecuta una sola carga efectiva al montar en StrictMode', async () => {
    const request = deferred()
    const loadData = vi.fn(() => request.promise)
    const { result } = renderHook(() => useFetch(loadData), { reactStrictMode: true })

    await act(async () => {})
    expect(loadData).toHaveBeenCalledTimes(1)

    await resolveRequest(request, ['Arroz'])
    expect(result.current).toMatchObject({ data: ['Arroz'], loading: false })
  })
})
