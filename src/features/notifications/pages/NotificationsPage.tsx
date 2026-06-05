import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { notificationService } from '@/shared/services'
import { formatDateTime, cn }  from '@/shared/utils'
import { PageHeader, Badge, EmptyState, Spinner } from '@/shared/components'
import type { NotificationType } from '@/shared/types'

const typeLabel: Record<NotificationType, string> = {
  low_stock:      'Stock bajo',
  sale_cancelled: 'Venta cancelada',
  alert:          'Alerta',
  info:           'Info',
}
const typeColor: Record<NotificationType, 'orange' | 'red' | 'blue' | 'gray'> = {
  low_stock:      'orange',
  sale_cancelled: 'red',
  alert:          'red',
  info:           'blue',
}

export function NotificationsPage() {
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  })

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err: Error) => toast.error(err.message),
  })

  const unread = notifications.filter(n => !n.read)

  return (
    <div className="space-y-4 max-w-lg">
      <PageHeader
        title="Notificaciones"
        subtitle={unread.length > 0 ? `${unread.length} sin leer` : 'Todo al dia'}
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Sin notificaciones"
          description="Aqui apareceran alertas de stock bajo, ventas canceladas y mas."
        />
      ) : (
        <div className="card overflow-hidden divide-y divide-border">
          {notifications.map(n => (
            <div key={n.id}
              className={cn(
                'p-4 transition-colors cursor-pointer',
                !n.read ? 'bg-accent-light/40 hover:bg-accent-light' : 'hover:bg-surface-raised'
              )}
              onClick={() => !n.read && markRead.mutate(n.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={typeColor[n.type]}>{typeLabel[n.type]}</Badge>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
                  </div>
                  <p className="text-sm font-medium text-text">{n.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                </div>
                <p className="text-xs font-mono text-text-subtle flex-shrink-0">
                  {formatDateTime(n.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-text-subtle font-mono text-center">
        Actualiza cada 30s — En versiones futuras: tiempo real via WebSocket
      </p>
    </div>
  )
}
