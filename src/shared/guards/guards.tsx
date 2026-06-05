import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import type { Role } from '@/shared/types'
import { useBusinessStore } from '@/shared/store/businessStore'

export function RequireAuth() {
  const token = useAuthStore(s => s.token)
  const location = useLocation()
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

export function RequireRole({ allowed }: { allowed: Role }) {

  const token = useAuthStore(s => s.token)
  const activeBusiness = useBusinessStore(s => s.activeBusiness)
  const location = useLocation()

  console.log('ACTIVE BUSINESS:', activeBusiness)
  console.log('ROLE:', activeBusiness?.my_role)
  console.log('ALLOWED:', allowed)

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = activeBusiness?.my_role

  if (!role || role !== allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-raised">
        <div className="text-center space-y-3">
          <p className="font-mono text-4xl font-bold text-border-strong">403</p>
          <p className="text-sm text-text-muted">
            No tienes permiso para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}