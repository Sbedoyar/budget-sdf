import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '../api/apiClient'
import { login, loginWithGoogle } from './authService'

vi.mock('../api/apiClient', () => ({
  default: { post: vi.fn() },
}))

beforeEach(() => {
  apiClient.post.mockReset()
})

describe('authService', () => {
  const session = { token: 'token-de-prueba', username: 'ana', role: 'PROPIETARIO' }

  it('envía usuario y contraseña y devuelve la sesión del backend', async () => {
    apiClient.post.mockResolvedValue({ data: session })

    await expect(login('ana', 'clave-de-prueba')).resolves.toBe(session)
    expect(apiClient.post).toHaveBeenCalledExactlyOnceWith(
      '/api/auth/login',
      { username: 'ana', password: 'clave-de-prueba' },
      { skipAuthExpiration: true },
    )
  })

  it('envía la credencial de Google y devuelve la sesión del backend', async () => {
    apiClient.post.mockResolvedValue({ data: session })

    await expect(loginWithGoogle('credencial-de-prueba')).resolves.toBe(session)
    expect(apiClient.post).toHaveBeenCalledExactlyOnceWith(
      '/api/auth/google',
      { credential: 'credencial-de-prueba' },
      { skipAuthExpiration: true },
    )
  })

  it.each([
    ['usuario y contraseña', () => login('ana', 'clave-de-prueba')],
    ['Google', () => loginWithGoogle('credencial-de-prueba')],
  ])('propaga el error de autenticación de %s', async (_, authenticate) => {
    const failure = { response: { status: 401, data: { message: 'Credenciales inválidas' } } }
    apiClient.post.mockRejectedValue(failure)

    await expect(authenticate()).rejects.toBe(failure)
  })
})
