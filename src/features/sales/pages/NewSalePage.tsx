import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { salesService, productService } from '@/shared/services'
import { formatCurrency } from '@/shared/utils'
import { PageHeader, Button, Input } from '@/shared/components'
import type { SaleItemCreate } from '@/shared/types'

const schema = z.object({
  notes: z.string().optional(),
  items: z.array(z.object({
    product_id:  z.string().optional(),
    description: z.string().optional(),
    qty:         z.number({ invalid_type_error: 'Ingresa una cantidad' }).positive(),
    unit_price:  z.number({ invalid_type_error: 'Ingresa un precio' }).positive(),
  })).min(1, 'Agrega al menos un producto'),
})
type FormData = z.infer<typeof schema>

export function NewSalePage() {
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const { data: frequent = [] } = useQuery({
    queryKey: ['products', 'frequent'],
    queryFn: productService.frequent,
  })

  const createSale = useMutation({
    mutationFn: salesService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); toast.success('Venta registrada'); navigate('/sales') },
    onError: (err: Error) => toast.error(err.message),
  })

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items  = watch('items')
  const total  = items.reduce((acc, it) => acc + (it.qty || 0) * (it.unit_price || 0), 0)

  const addProduct = (p: typeof frequent[0]) => {
    append({ product_id: p.id, description: p.name, qty: 1, unit_price: p.sell_price })
  }

  const onSubmit = (data: FormData) => {
    createSale.mutate({
      notes: data.notes,
      items: data.items.map(it => ({
        product_id: it.product_id, description: it.description,
        qty: it.qty, unit_price: it.unit_price,
      } as SaleItemCreate)),
    })
  }

  return (
    <div className="max-w-xl space-y-4">
      <PageHeader title="Nueva venta" />

      {frequent.length > 0 && (
        <div className="card-padded">
          <p className="label mb-3">Selección rápida</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {frequent.map(p => (
              <button key={p.id} type="button" onClick={() => addProduct(p)}
                className="p-3 rounded border border-border bg-surface hover:border-accent/40 hover:bg-accent-light text-left transition-colors">
                <p className="text-xs font-medium text-text leading-tight">{p.name}</p>
                <p className="text-xs font-mono text-accent mt-0.5">{formatCurrency(p.sell_price)}/{p.unit}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {fields.length > 0 && (
          <div className="card overflow-hidden">
            {fields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-start p-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text mb-1 truncate">{items[i]?.description ?? 'Producto'}</p>
                  <div className="flex gap-2">
                    <input type="number" step="0.01" placeholder="Cant."
                      className="input-base w-20 text-center"
                      {...register(`items.${i}.qty`, { valueAsNumber: true })} />
                    <input type="number" step="0.01" placeholder="Precio"
                      className="input-base flex-1"
                      {...register(`items.${i}.unit_price`, { valueAsNumber: true })} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pt-5">
                  <p className="text-xs font-semibold tabular-nums">
                    {formatCurrency((items[i]?.qty || 0) * (items[i]?.unit_price || 0))}
                  </p>
                  <button type="button" onClick={() => remove(i)} className="text-xs text-danger mt-1">Quitar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.items && (
          <p className="text-xs text-danger">{typeof errors.items.message === 'string' ? errors.items.message : ''}</p>
        )}

        <Input label="Notas (opcional)" placeholder="Observaciones de la venta..." {...register('notes')} />

        <div className="card-padded flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">{fields.length} producto(s)</p>
            <p className="text-xl font-bold text-text tabular-nums">{formatCurrency(total)}</p>
          </div>
          <Button type="submit" loading={createSale.isPending} disabled={fields.length === 0}>
            Confirmar venta
          </Button>
        </div>
      </form>
    </div>
  )
}
