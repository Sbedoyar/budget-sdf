import apiClient from '../api/apiClient'

const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  })

  const data = response.data

  localStorage.setItem('token', data.token)
  localStorage.setItem('username', data.username)
  localStorage.setItem('role', data.role)

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

export { login, logout, isAuthenticated }