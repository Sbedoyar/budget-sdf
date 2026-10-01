import apiClient from '../api/apiClient'

const saveSession = (data) => {
  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.username)
  localStorage.setItem('role', data.role)
}

const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  })

  const data = response.data

  saveSession(data)

  return data
}

const loginWithGoogle = async (credential) => {
  const response = await apiClient.post('/api/auth/google', {
    credential,
  })

  const data = response.data

  saveSession(data)

  return data
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
}

const isAuthenticated = () => {
  return Boolean(localStorage.getItem('token'))
}

export {
  login,
  loginWithGoogle,
  logout,
  isAuthenticated,
}