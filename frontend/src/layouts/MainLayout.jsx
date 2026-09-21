import {
  AlertTriangle,
  BarChart3,
  Boxes,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  UserRound,
  Warehouse,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'
import '../styles/layout.css'

function MainLayout() {
  const navigate = useNavigate()

  const username = localStorage.getItem('username') || 'Propietario'
  const role = localStorage.getItem('role') || 'PROPIETARIO'

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
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <PackageCheck size={30} strokeWidth={2.2} />
          </div>

          <div>
            <h1>Budget SDF</h1>
            <span>Tienda El Paraíso</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
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
          <div className="sidebar-profile">
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
          >
            <LogOut size={19} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-store">
            <div className="topbar-store-icon">
              <PackageCheck size={20} />
            </div>

            <div>
              <strong>Tienda El Paraíso</strong>
              <span>Sistema de gestión de inventario</span>
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