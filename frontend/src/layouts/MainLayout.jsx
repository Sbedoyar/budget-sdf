import { useContext, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  UserRound,
  Warehouse,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import '../styles/layout.css'
import logoBudgetSdf from '../assets/logo-budget-sdf.png'

// Proporciona navegación común, datos de sesión visibles y el espacio para la página activa.
function MainLayout() {
  const { username: sessionUsername, role: sessionRole, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 760px)')
    const closeMenuOnDesktop = (event) => {
      if (!event.matches) setMobileMenuOpen(false)
    }
    mobileViewport.addEventListener('change', closeMenuOnDesktop)
    return () => mobileViewport.removeEventListener('change', closeMenuOnDesktop)
  }, [])

  // El drawer mantiene el foco y el scroll dentro del menú hasta cerrarse.
  useEffect(() => {
    if (!mobileMenuOpen) return

    const previousOverflow = document.body.style.overflow
    const sidebar = sidebarRef.current
    const menuButton = menuButtonRef.current
    document.body.style.overflow = 'hidden'
    const focusMenu = () => sidebar.querySelector('button')?.focus({ preventScroll: true })
    const focusFrame = requestAnimationFrame(focusMenu)
    sidebar.addEventListener('transitionend', focusMenu, { once: true })

    const handleMenuKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
      if (event.key !== 'Tab') return

      const controls = sidebar.querySelectorAll('a[href], button:not(:disabled)')
      const firstControl = controls[0]
      const lastControl = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault()
        lastControl?.focus()
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault()
        firstControl?.focus()
      }
    }

    document.addEventListener('keydown', handleMenuKeyDown)
    return () => {
      cancelAnimationFrame(focusFrame)
      sidebar.removeEventListener('transitionend', focusMenu)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleMenuKeyDown)
      if (menuButton?.isConnected) menuButton.focus()
    }
  }, [mobileMenuOpen])

  const username = sessionUsername || 'Propietario'
  const role = sessionRole || 'PROPIETARIO'

  // Cierra la sesión local y navega a la pantalla de inicio de sesión.
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/categories',
      label: 'Categorías',
      icon: FolderOpen,
    },
    {
      to: '/products',
      label: 'Productos',
      icon: Boxes,
    },
    {
      to: '/movements',
      label: 'Movimientos',
      icon: Warehouse,
    },
    {
      to: '/alerts',
      label: 'Alertas',
      icon: AlertTriangle,
    },
    {
      to: '/reports',
      label: 'Reportes',
      icon: BarChart3,
    },
  ]

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú de navegación"
          tabIndex={-1}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        id="app-sidebar"
        ref={sidebarRef}
        className={`app-sidebar ${mobileMenuOpen ? 'app-sidebar-open' : ''}`}
        role={mobileMenuOpen ? 'dialog' : undefined}
        aria-modal={mobileMenuOpen ? true : undefined}
        aria-label="Menú de navegación"
      >
        <button
          type="button"
          className="sidebar-close-button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={22} />
        </button>
        <div className="sidebar-brand">
          <img
            src={logoBudgetSdf}
            alt="Budget SDF"
            className="sidebar-brand-logo"
          />
        </div>

        <nav className="sidebar-navigation">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `sidebar-nav-link ${
                    isActive ? 'sidebar-nav-link-active' : ''
                  }`
                }
              >
                <Icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile" title={`${username} · ${role}`}>
            <div className="profile-avatar">
              <UserRound size={20} />
            </div>

            <div className="profile-information">
              <strong>{username}</strong>
              <span>{role}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut size={19} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="app-main" inert={mobileMenuOpen}>
        <header className="app-topbar">
          <div className="topbar-leading">
            <button
              ref={menuButtonRef}
              type="button"
              className="topbar-menu-button"
              aria-label="Abrir menú de navegación"
              aria-controls="app-sidebar"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="topbar-store">
              <div className="topbar-store-icon">
                <PackageCheck size={20} />
              </div>

              <div>
                <strong>Tienda El Paraíso</strong>
                <span>Sistema de gestión de inventario</span>
              </div>
            </div>
          </div>

          <div className="topbar-user">
            <div className="topbar-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{username}</strong>
              <span>{role}</span>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
