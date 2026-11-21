import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { decodeToken } from '../api/api'
import { useAuth } from '../context/AuthContext.jsx'

function Loading() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-6xl items-center justify-center px-5">
      <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-sand)] border-t-[var(--color-plum)]" />
        Проверка доступа...
      </div>
    </div>
  )
}

function ProtectedRoute({ adminOnly = false, requiredRole = null }) {
  const { token, user, ready } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const claims = decodeToken(token)

  if ((adminOnly || requiredRole) && !ready) {
    return <Loading />
  }

  if (adminOnly) {
    const adminByClaims = claims?.role === 'admin' || claims?.is_staff || claims?.is_superuser
    const adminByUser = user?.role === 'admin' || user?.is_staff || user?.is_superuser

    if (!adminByClaims && !adminByUser) {
      return <Navigate to="/" replace />
    }
  }

  if (requiredRole) {
    const roleByClaims = claims?.role
    const role = user?.role || roleByClaims

    if (role !== requiredRole) {
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
