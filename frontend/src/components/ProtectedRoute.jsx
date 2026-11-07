import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Restringe el contenido hijo a sesiones autenticadas por el proveedor.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
