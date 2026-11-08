import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient, { configureApiAuth } from './apiClient'

let originalAdapter
let dispose
let session
let onSessionExpired

function respond(config, data = { ok: true }) {
  return { config, data, headers: {}, status: 200, statusText: 'OK' }
}

function httpError(config, status) {
  return new AxiosError('Error HTTP simulado', undefined, config, undefined, {
    ...respond(config),
    status,
  })
}

describe('apiClient', () => {
  beforeEach(() => {
    originalAdapter = apiClient.defaults.adapter
    session = { token: 'token-de-prueba', version: 1 }
    onSessionExpired = vi.fn()
    apiClient.defaults.adapter = vi.fn(async (config) => respond(config))
    dispose = configureApiAuth({ getSession: () => session, onSessionExpired })
  })

  afterEach(() => {
    dispose()
    apiClient.defaults.adapter = originalAdapter
    vi.unstubAllEnvs()
  })

  it('usa VITE_API_URL como URL base', async () => {
    vi.stubEnv('VITE_API_URL', 'https://budget.example.test')
    vi.resetModules()
    const { default: configuredClient } = await import('./apiClient')

    expect(configuredClient.defaults.baseURL).toBe('https://budget.example.test')
  })

  it('envía el JWT como Bearer y entrega la respuesta satisfactoria', async () => {
    const response = await apiClient.get('/api/reports/inventory')
    const config = apiClient.defaults.adapter.mock.calls[0][0]

    expect(config.headers.get('Authorization')).toBe('Bearer token-de-prueba')
    expect(response).toMatchObject({ status: 200, data: { ok: true } })
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('quita Authorization cuando la sesión no tiene token', async () => {
    session = { token: null, version: 2 }
    const response = await apiClient.get('/api/reports/inventory', {
      headers: { Authorization: 'Bearer token-anterior' },
    })

    expect(response.config.headers.has('Authorization')).toBe(false)
  })

  it.each([
    { status: 500, token: 'token-de-prueba', skipAuthExpiration: false, expires: false },
    { status: 401, token: 'token-de-prueba', skipAuthExpiration: false, expires: true },
    { status: 401, token: 'token-de-prueba', skipAuthExpiration: true, expires: false },
    { status: 401, token: null, skipAuthExpiration: false, expires: false },
  ])('propaga HTTP $status con token $token y exclusión $skipAuthExpiration', async ({
    status, token, skipAuthExpiration, expires,
  }) => {
    session.token = token
    let failure
    apiClient.defaults.adapter = async (config) => {
      failure = httpError(config, status)
      throw failure
    }

    const request = apiClient.get('/api/simulado', { skipAuthExpiration })
    await expect(request).rejects.toBe(failure)
    expect(onSessionExpired).toHaveBeenCalledTimes(expires ? 1 : 0)
  })

  it('ignora un 401 tardío para la expiración si cambió la versión aunque el JWT sea igual', async () => {
    let rejectOldRequest
    let failure
    apiClient.defaults.adapter = (config) => new Promise((resolve, reject) => {
      failure = httpError(config, 401)
      rejectOldRequest = () => reject(failure)
    })

    const request = apiClient.get('/api/simulado')
    const rejection = expect(request).rejects.toBe(failure)
    session = { ...session, version: 2 }
    rejectOldRequest()

    await rejection
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('retira ambos interceptores al limpiar la configuración', async () => {
    dispose()

    const response = await apiClient.get('/api/simulado')
    expect(response.config.headers.has('Authorization')).toBe(false)

    apiClient.defaults.adapter = async (config) => {
      throw httpError(config, 401)
    }

    await expect(apiClient.get('/api/simulado')).rejects.toMatchObject({ response: { status: 401 } })
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})
