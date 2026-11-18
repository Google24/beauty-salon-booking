import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ProtectedRoute({ adminOnly = false, requiredRole = null }) {
  const { token, user } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if ((adminOnly || requiredRole) && !user) {
    return <p>Проверка доступа...</p>
  }

  if (adminOnly && !(user.is_staff || user.role === 'admin')) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute