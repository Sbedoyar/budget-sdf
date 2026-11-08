// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react'
import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '../api/apiClient'
import { useAuth } from '../hooks/useAuth'
import { login, loginWithGoogle } from '../services/authService'
import AuthProvider from './AuthProvider'

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
}))

const storedSession = { token: 'jwt-de-prueba', username: 'ana', role: 'PROPIETARIO' }
const newSession = { ...storedSession, username: 'luz' }
const emptySession = { token: null, username: null, role: null }
let originalAdapter

function persist(session) {
  for (const [key, value] of Object.entries(session)) localStorage.setItem(key, value)
}

function expectStoredSession(session) {
  for (const [key, value] of Object.entries(session)) {
    expect(localStorage.getItem(key)).toBe(value)
  }
}

function unauthorized(config) {
  return new AxiosError('Sesión rechazada', undefined, config, undefined, {
    status: 401, statusText: 'Unauthorized', headers: {}, config, data: {},
  })
}

function renderSession() {
  return renderHook(useAuth, { wrapper: AuthProvider, reactStrictMode: true })
}

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
  originalAdapter = apiClient.defaults.adapter
  apiClient.defaults.adapter = async () => {
    throw new Error('La prueba requiere un adaptador simulado')
  }
})

afterEach(() => {
  cleanup()
  apiClient.defaults.adapter = originalAdapter
  localStorage.clear()
})

describe('AuthProvider', () => {
  it('expone una sesión vacía cuando no hay datos persistidos', () => {
    const { result } = renderSession()

    expect(result.current).toMatchObject({ ...emptySession, isAuthenticated: false })
  })

  it('restaura token, usuario y rol al montar el proveedor', () => {
    persist(storedSession)
    const { result } = renderSession()

    expect(result.current).toMatchObject({ ...storedSession, isAuthenticated: true })
  })

  it.each([
    ['contraseña', 'login', login, ['luz', 'clave-de-prueba']],
    ['Google', 'loginWithGoogle', loginWithGoogle, ['credencial-de-prueba']],
  ])('actualiza a quien consume useAuth y persiste la sesión al entrar con %s', async (_, method, service, args) => {
    const { result } = renderSession()
    service.mockResolvedValue(newSession)

    await act(async () => {
      await expect(result.current[method](...args)).resolves.toBe(newSession)
    })

    expect(service).toHaveBeenCalledExactlyOnceWith(...args)
    expect(result.current).toMatchObject({ ...newSession, isAuthenticated: true })
    expectStoredSession(newSession)
  })

  it('cierra la sesión del consumidor y borra sus tres datos persistidos', () => {
    persist(storedSession)
    const { result } = renderSession()

    act(() => result.current.logout())

    expect(result.current).toMatchObject({ ...emptySession, isAuthenticated: false })
    expectStoredSession(emptySession)
  })

  it.each([
    ['contraseña', 'login', login, ['luz', 'clave-de-prueba']],
    ['Google', 'loginWithGoogle', loginWithGoogle, ['credencial-de-prueba']],
  ])('propaga el rechazo del inicio con %s sin guardar una sesión', async (_, method, service, args) => {
    const { result } = renderSession()
    const failure = new Error('Credenciales rechazadas')
    service.mockRejectedValue(failure)

    await act(async () => {
      await expect(result.current[method](...args)).rejects.toBe(failure)
    })

    expect(result.current).toMatchObject({ ...emptySession, isAuthenticated: false })
    expectStoredSession(emptySession)
  })

  it('un 401 de la sesión actual borra la sesión y avisa al consumidor', async () => {
    persist(storedSession)
    const { result } = renderSession()
    apiClient.defaults.adapter = async (config) => {
      throw unauthorized(config)
    }

    await act(async () => {
      await expect(apiClient.get('/api/reports/inventory')).rejects.toMatchObject({ response: { status: 401 } })
    })

    expect(result.current).toMatchObject({ ...emptySession, isAuthenticated: false })
    expectStoredSession(emptySession)
  })

  it('un 401 de una solicitud anterior conserva la nueva sesión aunque se reutilice el JWT', async () => {
    persist(storedSession)
    const { result } = renderSession()
    let rejectRequest
    apiClient.defaults.adapter = (config) => new Promise((resolve, reject) => {
      rejectRequest = () => reject(unauthorized(config))
    })
    const request = apiClient.get('/api/reports/inventory')
    login.mockResolvedValue(newSession)

    await act(async () => {
      await result.current.login('luz', 'clave-de-prueba')
    })

    await act(async () => {
      const rejection = expect(request).rejects.toMatchObject({ response: { status: 401 } })
      rejectRequest()
      await rejection
    })

    expect(result.current).toMatchObject({ ...newSession, isAuthenticated: true })
    expectStoredSession(newSession)
  })
})
