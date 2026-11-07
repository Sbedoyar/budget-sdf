import { getErrorMessage } from '../utils/getErrorMessage'
import { useEffect, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CheckCircle2,
  CircleAlert,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import '../styles/pages/login.css'
import logoBudgetSdf from '../assets/logo-budget-sdf.png'

// Gestiona el acceso local y con Google; ambas opciones guardan la sesión y conducen al dashboard.
function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const googleContainerRef = useRef(null)
  const [googleButtonWidth, setGoogleButtonWidth] = useState(356)

  // Google dibuja un iframe: su API necesita el ancho real del contenedor.
  useEffect(() => {
    const container = googleContainerRef.current
    const observer = new ResizeObserver(([entry]) => {
      setGoogleButtonWidth(Math.min(356, Math.floor(entry.contentRect.width)))
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [googleMessage, setGoogleMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Envía usuario y contraseña al servicio y comunica errores devueltos por el backend.
  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setGoogleMessage('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (error) {
      setError(
        getErrorMessage(error, 'No fue posible iniciar sesión'),
      )
    } finally {
      setLoading(false)
    }
  }

  // Envía al backend la credencial emitida por Google para que valide la identidad y cree el JWT.
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setGoogleMessage('')

    if (!credentialResponse.credential) {
      setError(
        'Google no devolvió una credencial válida. Intenta nuevamente.',
      )
      return
    }

    try {
      setGoogleMessage(
        'Validando tu cuenta con Google...',
      )

      await loginWithGoogle(
        credentialResponse.credential,
      )

      navigate('/dashboard')
    } catch (error) {
      setGoogleMessage('')

      setError(
        getErrorMessage(error, 'No fue posible iniciar sesión con Google'),
      )
    }
  }

  // Presenta un mensaje cuando el proveedor no completa la autenticación.
  const handleGoogleError = () => {
    setGoogleMessage('')
    setError(
      'No fue posible iniciar sesión con Google. Intenta nuevamente.',
    )
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="login-brand">
            <img
              src={logoBudgetSdf}
              alt="Budget SDF - Sistema de gestión de inventario"
              className="login-brand-logo"
            />
          </div>

          <div className="login-presentation">
            <span className="login-eyebrow">
              Tienda El Paraíso
            </span>

            <h1>
              Controla tu inventario de forma
              <span> simple y organizada.</span>
            </h1>

            <p>
              Administra productos, movimientos, alertas y reportes
              desde una sola plataforma.
            </p>
          </div>

          <div className="login-feature-list">
            <article className="login-feature">
              <div className="login-feature-icon">
                <PackageCheck size={19} />
              </div>

              <div>
                <strong>Control de inventario</strong>
                <span>
                  Consulta existencias y niveles mínimos de stock.
                </span>
              </div>
            </article>

            <article className="login-feature">
              <div className="login-feature-icon">
                <BarChart3 size={19} />
              </div>

              <div>
                <strong>Reportes y seguimiento</strong>
                <span>
                  Visualiza movimientos e indicadores del negocio.
                </span>
              </div>
            </article>

            <article className="login-feature">
              <div className="login-feature-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>Acceso protegido</strong>
                <span>
                  Autenticación segura para el uso del sistema.
                </span>
              </div>
            </article>
          </div>
        </div>

        <div className="login-brand-footer">
          <ShieldCheck size={15} />
          <span>Sistema de gestión de inventario</span>
        </div>
      </section>

      <section className="login-access-panel">
        <div className="login-card">
          <div className="login-mobile-brand">
            <img
              src={logoBudgetSdf}
              alt="Budget SDF"
              className="login-mobile-brand-logo"
            />
          </div>

          <div className="login-header">
            <span className="login-header-kicker">
              Bienvenido
            </span>

            <h2>Inicia sesión</h2>

            <p>
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label
                htmlFor="username"
                className="form-label login-label"
              >
                Usuario
              </label>

              <div className="login-field">
                <User size={17} />

                <input
                  id="username"
                  className="login-input"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group login-form-group">
              <label
                htmlFor="password"
                className="form-label login-label"
              >
                Contraseña
              </label>

              <div className="login-field">
                <LockKeyhole size={17} />

                <input
                  id="password"
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="login-feedback login-feedback-error">
                <CircleAlert size={17} />
                <span>{error}</span>
              </div>
            )}

            {googleMessage && (
              <div className="login-feedback login-feedback-success">
                <CheckCircle2 size={17} />
                <span>{googleMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              <LockKeyhole size={17} />
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-divider">
            <span>o continúa con</span>
          </div>

          <div className="login-google-section" ref={googleContainerRef}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
              width={googleButtonWidth}
            />
          </div>

          <div className="login-security-note">
            <ShieldCheck size={16} />

            <p>
              El acceso está protegido y tus credenciales se
              procesan de forma segura.
            </p>
          </div>
        </div>

        <p className="login-copyright">
          Budget SDF · Tienda El Paraíso
        </p>
      </section>
    </main>
  )
}

export default LoginPage
