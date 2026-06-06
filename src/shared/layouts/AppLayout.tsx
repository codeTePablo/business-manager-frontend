import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore }     from '@/shared/store/authStore'
import { useBusinessStore } from '@/shared/store/businessStore'
import { authService }      from '@/shared/services'
import { cn }               from '@/shared/utils'
import toast                from 'react-hot-toast'

const OWNER_NAV = [
  { to: '/dashboard',     label: 'Dashboard'      },
  { to: '/sales',         label: 'Ventas'         },
  { to: '/invoices',      label: 'Facturas'       },
  { to: '/iot',           label: 'Monitor IoT'    },
  { to: '/notifications', label: 'Notificaciones' },
]

export function AppLayout({ minimal = false }: { minimal?: boolean }) {
  const { user, clearAuth }               = useAuthStore()
  const { activeBusiness, clearBusiness } = useBusinessStore()
  const navigate                          = useNavigate()
  const [collapsed, setCollapsed]         = useState(false)

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth(); clearBusiness()
    navigate('/login')
    toast.success('Sesión cerrada')
  }

  return (
    <div className="flex min-h-screen bg-surface-raised">
      {!minimal && (
        <aside className={cn(
          'flex-shrink-0 bg-surface border-r border-border flex flex-col fixed top-0 bottom-0 left-0 transition-all duration-200',
          collapsed ? 'w-12' : 'w-56'
        )}>
          {/* Header del sidebar */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-border">
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold tracking-tight text-text text-sm">AbastOS</p>
                <p className="text-xs text-text-muted font-mono truncate mt-0.5">
                  {activeBusiness?.name ?? '—'}
                </p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(c => !c)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-surface-inset text-text-muted hover:text-text transition-colors"
              title={collapsed ? 'Expandir' : 'Colapsar'}
            >
              {collapsed ? '›' : '‹'}
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 overflow-y-auto">
            {OWNER_NAV.map(({ to, label }) => (
              <NavLink key={to} to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 py-2 text-sm transition-colors border-l-2',
                  collapsed ? 'px-3 justify-center' : 'px-5',
                  isActive
                    ? 'border-accent text-accent bg-accent-light font-medium'
                    : 'border-transparent text-text-muted hover:text-text hover:bg-surface-raised'
                )}>
                {/* Punto indicador cuando está colapsado */}
                {collapsed
                  ? <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  : label
                }
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="p-4 border-t border-border space-y-1">
              <p className="text-xs text-text-muted truncate">{user?.name}</p>
              <button onClick={handleLogout}
                className="text-xs text-text-muted hover:text-danger transition-colors">
                Cerrar sesión
              </button>
            </div>
          )}

          {/* Footer colapsado — solo botón logout */}
          {collapsed && (
            <div className="p-2 border-t border-border flex justify-center">
              <button onClick={handleLogout}
                title="Cerrar sesión"
                className="text-xs text-text-muted hover:text-danger transition-colors">
                ×
              </button>
            </div>
          )}
        </aside>
      )}

      <main className={cn(
        'flex-1 min-h-screen transition-all duration-200',
        !minimal && (collapsed ? 'ml-12' : 'ml-56')
      )}>
        {minimal && (
          <header className="h-12 bg-surface border-b border-border flex items-center justify-between px-5">
            <p className="text-sm font-semibold text-text">AbastOS</p>
            <button onClick={handleLogout}
              className="text-xs text-text-muted hover:text-danger transition-colors">
              Cerrar sesión
            </button>
          </header>
        )}
        <div className="p-3 md:p-6 page-enter"><Outlet /></div>
      </main>
    </div>
  )
}