import { useQuery }    from '@tanstack/react-query'
import { Link }        from 'react-router-dom'
import { salesService } from '@/shared/services'
import { formatCurrency, formatDateTime } from '@/shared/utils'
import { PageHeader, Button, Badge, EmptyState, Spinner } from '@/shared/components'

export function SalesPage() {
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: salesService.list,
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ventas"
        subtitle={`${sales.filter(s => !s.cancelled).length} activas`}
        action={<Link to="/sales/new"><Button>Nueva venta</Button></Link>}
      />
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : sales.length === 0 ? (
        <EmptyState title="Sin ventas" description="Las ventas registradas aparecerán aquí." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised">
                {['Fecha', 'Registrada por', 'Productos', 'Total', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b border-border last:border-0 hover:bg-surface-raised transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-text-muted">{formatDateTime(sale.created_at)}</td>
                  <td className="px-4 py-2.5 text-xs text-text">{sale.registered_by ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-text-muted">{sale.items.length} producto(s)</td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-text tabular-nums">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-2.5">
                    {sale.cancelled ? <Badge color="red">Cancelada</Badge> : <Badge color="green">Activa</Badge>}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link to={`/sales/${sale.id}`} className="text-xs text-accent hover:underline">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
