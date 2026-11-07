import apiClient from '../api/apiClient'

/** Inicia sesión con usuario y contraseña mediante POST /api/auth/login. */
const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  }, { skipAuthExpiration: true })

  return response.data
}

/** Valida la credencial Google mediante POST /api/auth/google. */
const loginWithGoogle = async (credential) => {
  const response = await apiClient.post('/api/auth/google', {
    credential,
  }, { skipAuthExpiration: true })

  return response.data
}

export { login, loginWithGoogle }
