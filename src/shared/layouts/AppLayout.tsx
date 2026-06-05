// ── ARCHIVO: src/shared/layouts/AppLayout.tsx ─────────────────────────────
// CAMBIO: agregar "Monitor IoT" al OWNER_NAV
// ─────────────────────────────────────────────────────────────────────────
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore }     from '@/shared/store/authStore'
import { useBusinessStore } from '@/shared/store/businessStore'
import { authService }      from '@/shared/services'
import { cn }               from '@/shared/utils'
import toast                from 'react-hot-toast'

// ── CAMBIO: agregar entrada de IoT al nav ─────────────────────────────────
const OWNER_NAV = [
  { to: '/dashboard',     label: 'Dashboard'       },
  { to: '/sales',         label: 'Ventas'          },
  { to: '/employees',     label: 'Empleados'       },
  { to: '/invoices',      label: 'Facturas'        },
  { to: '/iot',           label: 'Monitor IoT'     },  // <-- NUEVO
  { to: '/notifications', label: 'Notificaciones'  },
]

export function AppLayout({ minimal = false }: { minimal?: boolean }) {
  const { user, clearAuth }               = useAuthStore()
  const { activeBusiness, clearBusiness } = useBusinessStore()
  const navigate                          = useNavigate()

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth(); clearBusiness()
    navigate('/login')
    toast.success('Sesion cerrada')
  }

  return (
    <div className="flex min-h-screen bg-surface-raised">
      {!minimal && (
        <aside className="w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col fixed top-0 bottom-0 left-0">
          <div className="px-5 py-4 border-b border-border">
            <p className="font-semibold tracking-tight text-text">AbastOS</p>
            <p className="text-xs text-text-muted font-mono truncate mt-0.5">
              {activeBusiness?.name ?? '—'}
            </p>
          </div>
          <nav className="flex-1 py-3 overflow-y-auto">
            {OWNER_NAV.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-5 py-2 text-sm transition-colors border-l-2',
                  isActive
                    ? 'border-accent text-accent bg-accent-light font-medium'
                    : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised'
                )}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-1">
            <p className="text-xs text-text-muted truncate">{user?.name}</p>
            <button onClick={handleLogout}
              className="text-xs text-text-muted hover:text-danger transition-colors">
              Cerrar sesion
            </button>
          </div>
        </aside>
      )}

      <main className={cn('flex-1 min-h-screen', !minimal && 'ml-56')}>
        {minimal && (
          <header className="h-12 bg-surface border-b border-border flex items-center justify-between px-5">
            <p className="text-sm font-semibold text-text">AbastOS</p>
            <button onClick={handleLogout}
              className="text-xs text-text-muted hover:text-danger transition-colors">
              Cerrar sesion
            </button>
          </header>
        )}
        <div className="p-6 page-enter"><Outlet /></div>
      </main>
    </div>
  )
}
