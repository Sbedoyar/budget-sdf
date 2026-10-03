import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../services/authService'

// Restringe el contenido hijo a sesiones con un JWT presente en el almacenamiento local.
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute