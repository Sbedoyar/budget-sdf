import apiClient from '../api/apiClient'

// Persiste los datos de sesión que usan las rutas protegidas y el cliente HTTP.
const saveSession = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.username)
  localStorage.setItem('role', data.role)
}

/** Inicia sesión con usuario y contraseña mediante POST /api/auth/login. */
const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  })

  const data = response.data

  saveSession(data)

  return data
}

/** Valida la credencial Google mediante POST /api/auth/google y guarda la sesión resultante. */
const loginWithGoogle = async (credential) => {
  const response = await apiClient.post('/api/auth/google', {
    credential,
  })

  const data = response.data

  saveSession(data)

  return data
}

/** Elimina del navegador el JWT y los datos asociados al usuario actual. */
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
}

/** Indica si existe un JWT guardado para permitir el acceso a las rutas privadas. */
const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'))
}

export {
  login,
  loginWithGoogle,
  logout,
  isAuthenticated,
}