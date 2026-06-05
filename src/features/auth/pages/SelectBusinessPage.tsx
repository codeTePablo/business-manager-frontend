import { useQuery }   from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { businessService }  from '@/shared/services'
import { useBusinessStore } from '@/shared/store/businessStore'
import { useAuthStore }     from '@/shared/store/authStore'
import { Spinner }          from '@/shared/components'
import type { Business, Role }    from '@/shared/types'

export function SelectBusinessPage() {
  const { setActiveBusiness } = useBusinessStore()
  const role     = useAuthStore(s => s.user?.role)
  const navigate = useNavigate()

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses'],
    queryFn: businessService.list,
  })

  const select = (b: Business) => {
    setActiveBusiness(b)
    // Actualizar el rol según el negocio elegido
    const currentUser = useAuthStore.getState().user
    if (currentUser) {
      setAuth(useAuthStore.getState().token!, { ...currentUser, role: b.my_role })
    }
    navigate(b.my_role === 'dueno' ? '/dashboard' : '/register-sale')
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-raised">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold tracking-tight">AbastOS</p>
          <p className="text-xs text-text-muted mt-1">Selecciona el negocio con el que deseas continuar</p>
        </div>
        {businesses.map(b => (
          <button key={b.id} onClick={() => select(b)}
            className="w-full card p-4 text-left hover:border-accent/50 hover:shadow-card-hover transition-all">
            <p className="text-sm font-medium text-text">{b.name}</p>
            <p className="text-xs text-text-muted font-mono mt-0.5">{b.my_role}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
function setAuth(arg0: string, arg1: { role: Role; id: string; name: string; email: string }) {
  throw new Error('Function not implemented.')
}

