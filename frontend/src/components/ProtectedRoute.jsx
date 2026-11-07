import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Restringe el contenido hijo a sesiones con un JWT presente en el almacenamiento local.
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
