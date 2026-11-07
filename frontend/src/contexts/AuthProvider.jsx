import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { AuthContext } from './AuthContext'
import { configureApiAuth } from '../api/apiClient'
import {
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
} from '../services/authService'

function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
  }))
  // Permite que las solicitudes lean la sesión vigente sin esperar al siguiente render.
  const sessionRef = useRef(session)
  const sessionVersion = useRef(0)

  const updateSession = useCallback((nextSession) => {
    sessionRef.current = nextSession
    sessionVersion.current += 1
    setSession(nextSession)

    for (const key of ['token', 'username', 'role']) {
      if (nextSession[key] === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, nextSession[key])
      }
    }
  }, [])

  const logout = useCallback(() => {
    updateSession({ token: null, username: null, role: null })
  }, [updateSession])

  // Configura Axios antes de que las páginas soliciten datos en sus efectos.
  useLayoutEffect(() => configureApiAuth({
    getSession: () => ({
      token: sessionRef.current.token,
      version: sessionVersion.current,
    }),
    onSessionExpired: logout,
  }), [logout])

  const login = async (username, password) => {
    const data = await loginRequest(username, password)
    updateSession({ token: data.token, username: data.username, role: data.role })
    return data
  }

  const loginWithGoogle = async (credential) => {
    const data = await loginWithGoogleRequest(credential)
    updateSession({ token: data.token, username: data.username, role: data.role })
    return data
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
