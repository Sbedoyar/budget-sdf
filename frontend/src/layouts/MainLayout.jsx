import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../services/authService'

function MainLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h1 className="sidebar-title">Budget SDF</h1>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="sidebar-link">
            Dashboard
          </NavLink>

          <NavLink to="/categories" className="sidebar-link">
            Categorías
          </NavLink>

          <NavLink to="/products" className="sidebar-link">
            Productos
          </NavLink>

          <NavLink to="/movements" className="sidebar-link">
            Movimientos
          </NavLink>

          <NavLink to="/alerts" className="sidebar-link">
            Alertas
          </NavLink>

          <NavLink to="/reports" className="sidebar-link">
            Reportes
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout