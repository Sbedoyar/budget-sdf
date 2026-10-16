import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  logout as clearStoredSession,
} from '../services/authService'

// Comparte la sesión en React; authService conserva su persistencia en localStorage.
function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
  }))

  // El interceptor 401 puede limpiar la sesión sin recargar si ya estamos en /login.
  useEffect(() => {
    const handleSessionExpired = () => {
      setSession({ token: null, username: null, role: null })
    }

    window.addEventListener('auth-session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth-session-expired', handleSessionExpired)
  }, [])

  const login = async (username, password) => {
    const data = await loginRequest(username, password)
    setSession({ token: data.token, username: data.username, role: data.role })
    return data
  }

  const loginWithGoogle = async (credential) => {
    const data = await loginWithGoogleRequest(credential)
    setSession({ token: data.token, username: data.username, role: data.role })
    return data
  }

  const logout = () => {
    clearStoredSession()
    setSession({ token: null, username: null, role: null })
  }

  return (
    <AuthContext.Provider value={{
      token: session.token,
      username: session.username,
      role: session.role,
      isAuthenticated: Boolean(session.token),
      login,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
