import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { salesService, productService } from '@/shared/services'
import { formatCurrency, cn } from '@/shared/utils'
import { Button, Spinner } from '@/shared/components'
import type { SaleItemCreate } from '@/shared/types'

const schema = z.object({
  items: z.array(z.object({
    product_id:  z.string().optional(),
    description: z.string().optional(),
    qty:         z.number().positive(),
    unit_price:  z.number().positive(),
  })).min(1),
})
type FormData = z.infer<typeof schema>

export function RegisterSalePage() {
  const qc = useQueryClient()

  const { data: frequent = [], isLoading } = useQuery({
    queryKey: ['products', 'frequent'],
    queryFn: productService.frequent,
    staleTime: 300_000,
  })

  const createSale = useMutation({
    mutationFn: salesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      reset()
      toast.success('Venta registrada correctamente')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const { register, handleSubmit, control, watch, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [] },
  })
  const { fields, append, remove, update } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const total = items.reduce((acc, it) => acc + (it.qty || 0) * (it.unit_price || 0), 0)

  const addProduct = (p: typeof frequent[0]) => {
    const existingIdx = items.findIndex(it => it.product_id === p.id)
    if (existingIdx >= 0) {
      const current = items[existingIdx]
      update(existingIdx, { ...current, qty: (current.qty || 0) + 1 })
    } else {
      append({ product_id: p.id, description: p.name, qty: 1, unit_price: p.sell_price })
    }
  }

  const onSubmit = (data: FormData) => {
    createSale.mutate({
      items: data.items.map(it => ({
        product_id: it.product_id,
        description: it.description,
        qty: it.qty,
        unit_price: it.unit_price,
      } as SaleItemCreate)),
    })
  }

  if (isLoading) return (
    <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md mx-auto pb-28">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Productos frecuentes</p>

      <div className="grid grid-cols-2 gap-2">
        {frequent.map(p => {
          const inCart = items.some(it => it.product_id === p.id)
          return (
            <button key={p.id} type="button" onClick={() => addProduct(p)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all active:scale-95',
                inCart ? 'border-accent bg-accent-light shadow-sm' : 'border-border bg-surface hover:border-accent/40',
                p.low_stock && 'border-warning/50'
              )}>
              <p className="text-sm font-medium text-text leading-tight">{p.name}</p>
              <p className="text-xs font-mono text-accent mt-1">{formatCurrency(p.sell_price)}/{p.unit}</p>
              {p.low_stock && <p className="text-xs text-warning mt-1">Stock bajo</p>}
            </button>
          )
        })}
      </div>

      {fields.length > 0 && (
        <div className="card overflow-hidden">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text truncate">{items[i]?.description}</p>
                <p className="text-xs font-mono text-text-muted">{formatCurrency(items[i]?.unit_price || 0)}</p>
              </div>
              <input type="number" step="0.01" min="0.01"
                className="input-base w-20 text-center"
                {...register(`items.${i}.qty`, { valueAsNumber: true })} />
              <p className="text-xs font-semibold tabular-nums w-20 text-right">
                {formatCurrency((items[i]?.qty || 0) * (items[i]?.unit_price || 0))}
              </p>
              <button type="button" onClick={() => remove(i)} className="text-danger text-sm leading-none">×</button>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        'fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4',
        'flex items-center justify-between shadow-modal',
        fields.length === 0 && 'opacity-50 pointer-events-none'
      )}>
        <div>
          <p className="text-xs text-text-muted">{fields.length} producto(s)</p>
          <p className="text-lg font-bold tabular-nums">{formatCurrency(total)}</p>
        </div>
        <Button type="submit" loading={createSale.isPending} disabled={fields.length === 0}>
          Confirmar venta
        </Button>
      </div>
    </form>
  )
}
