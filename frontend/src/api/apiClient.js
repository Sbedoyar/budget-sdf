import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function configureApiAuth({ getSession, onSessionExpired }) {
  const requestInterceptor = apiClient.interceptors.request.use((config) => {
    const { token, version } = getSession()
    config.authSessionVersion = version

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers.delete('Authorization')
    }

    return config
  }, undefined, { synchronous: true })

  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config
      const { token, version } = getSession()

      // Un 401 de login o de una sesión anterior no debe cerrar la sesión actual.
      if (
        error.response?.status === 401 &&
        !config?.skipAuthExpiration &&
        token &&
        config?.authSessionVersion === version
      ) {
        onSessionExpired()
      }

      return Promise.reject(error)
    },
  )

  // Evita acumular interceptores al desmontar el proveedor o en StrictMode.
  return () => {
    apiClient.interceptors.request.eject(requestInterceptor)
    apiClient.interceptors.response.eject(responseInterceptor)
  }
}

export default apiClient
