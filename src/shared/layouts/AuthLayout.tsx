import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-raised flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-text">AbastOS</p>
          <p className="text-xs text-text-muted font-mono mt-1">Sistema de administración</p>
        </div>
        <div className="card p-6"><Outlet /></div>
      </div>
    </div>
  )
}
