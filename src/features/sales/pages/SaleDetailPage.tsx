import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { salesService } from '@/shared/services'
import { formatCurrency, formatDateTime } from '@/shared/utils'
import { PageHeader, Button, Badge, EmptyState, Spinner } from '@/shared/components'

export function SaleDetailPage() {
  const { id = '' }  = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const qc           = useQueryClient()

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sales', id],
    queryFn: () => salesService.get(id),
    enabled: !!id,
  })

  const cancelSale = useMutation({
    mutationFn: ({ saleId, reason }: { saleId: string; reason: string }) =>
      salesService.cancel(saleId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      toast.success('Venta cancelada')
      navigate('/sales')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleCancel = () => {
    const reason = window.prompt('Motivo de cancelación:')
    if (!reason?.trim()) return
    cancelSale.mutate({ saleId: id, reason })
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  if (!sale) return <EmptyState title="Venta no encontrada" />

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader
        title="Detalle de venta"
        action={!sale.cancelled && (
          <Button variant="danger" onClick={handleCancel} loading={cancelSale.isPending}>
            Cancelar venta
          </Button>
        )}
      />
      <div className="card-padded space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="label">Fecha</p><p className="font-mono text-xs">{formatDateTime(sale.created_at)}</p></div>
          <div><p className="label">Registrada por</p><p>{sale.registered_by ?? '—'}</p></div>
          <div><p className="label">Pago</p><p className="capitalize">{sale.payment_type}</p></div>
          <div><p className="label">Estado</p>
            {sale.cancelled ? <Badge color="red">Cancelada</Badge> : <Badge color="green">Activa</Badge>}
          </div>
        </div>
        {sale.notes && (
          <div className="border-t border-border pt-3">
            <p className="label">Notas</p>
            <p className="text-sm text-text-muted">{sale.notes}</p>
          </div>
        )}
        {sale.cancelled_reason && (
          <div className="p-3 rounded bg-danger-light border border-danger-border text-xs text-danger">
            Motivo: {sale.cancelled_reason}
          </div>
        )}
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-surface-raised">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Productos</p>
        </div>
        {sale.items.map(item => (
          <div key={item.id} className="flex justify-between items-center px-4 py-2.5 border-b border-border last:border-0">
            <div>
              <p className="text-sm text-text">{item.product_name ?? item.description}</p>
              <p className="text-xs font-mono text-text-muted">{item.qty} x {formatCurrency(item.unit_price)}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(item.subtotal)}</p>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 bg-surface-raised border-t border-border">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-sm font-bold text-accent tabular-nums">{formatCurrency(sale.total)}</p>
        </div>
      </div>
    </div>
  )
}
