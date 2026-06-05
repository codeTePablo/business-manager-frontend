import { useQuery } from '@tanstack/react-query'
import { salesService, inventoryService } from '@/shared/services'
import { formatCurrency, formatTime }     from '@/shared/utils'
import { StatCard, PageHeader, Spinner, Badge, EmptyState } from '@/shared/components'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Sale } from '@/shared/types'

function RecentSaleRow({ sale }: { sale: Sale }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-text truncate">
          {sale.items[0]?.product_name ?? sale.items[0]?.description ?? 'Venta'}
          {sale.items.length > 1 && ` +${sale.items.length - 1}`}
        </p>
        <p className="text-xs text-text-muted font-mono">
          {formatTime(sale.created_at)} — {sale.registered_by ?? 'Empleado'}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        {sale.cancelled && <Badge color="red">Cancelada</Badge>}
        <span className="text-sm font-semibold text-text tabular-nums">
          {formatCurrency(sale.total)}
        </span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['sales', 'summary', 'today'],
    queryFn: () => salesService.summary(), // <-- Función anónima aquí
    refetchInterval: 60_000,
  })
  
  const { data: recentSales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales', 'recent'],
    queryFn: () => salesService.list(), // <-- Función anónima aquí
    select: (data) => data.slice(0, 8),
  })
  
  const { data: inventory } = useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: () => inventoryService.summary(), // <-- Función anónima aquí
    refetchInterval: 120_000,
  })

  const chartData = Array.from({ length: 8 }, (_, i) => {
    const d = new Date()
    d.setHours(d.getHours() - (7 - i), 0, 0, 0)
    const h = d.getHours()
    const total = recentSales
      .filter(s => new Date(s.created_at).getHours() === h && !s.cancelled)
      .reduce((acc, s) => acc + s.total, 0)
    return { label: `${h}:00`, total }
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loadingSummary ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card-padded h-20 flex items-center justify-center"><Spinner size="sm" /></div>
          ))
        ) : (
          <>
            <StatCard label="Ventas hoy"     value={formatCurrency(summary?.total_sales ?? 0)} accent />
            <StatCard label="Transacciones"  value={summary?.sales_count ?? 0} />
            <StatCard label="Canceladas"     value={summary?.cancelled_count ?? 0} />
            <StatCard label="Stock bajo"     value={inventory?.low_stock_count ?? 0}
              sub={`${inventory?.out_of_stock_count ?? 0} agotados`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card-padded">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">Ventas por hora — hoy</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Total']}
                contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6 }} />
              <Bar dataKey="total" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 card-padded">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Ventas recientes</p>
          {loadingSales ? (
            <div className="flex items-center justify-center h-32"><Spinner /></div>
          ) : recentSales.length === 0 ? (
            <EmptyState title="Sin ventas hoy" description="Las ventas del día aparecerán aquí." />
          ) : (
            recentSales.map(s => <RecentSaleRow key={s.id} sale={s} />)
          )}
        </div>
      </div>

      {(inventory?.low_stock_count ?? 0) > 0 && (
        <div className="card-padded border-warning/40 bg-warning-light">
          <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-3">Productos con stock bajo</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {inventory!.low_stock_products.map(p => (
              <div key={p.product_id} className="bg-surface rounded p-3 border border-warning/20">
                <p className="text-xs font-medium text-text truncate">{p.product_name}</p>
                <p className="text-xs font-mono text-warning mt-0.5">
                  {p.current_stock} {p.sell_unit} restantes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
