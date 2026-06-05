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

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const role = activeBusiness?.my_role

  if (!role || role !== allowed) {
    const redirectTo = role === 'dueno' ? '/dashboard' : '/register-sale'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}