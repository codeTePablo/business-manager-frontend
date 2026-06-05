import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm }    from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }          from 'zod'
import { useState }   from 'react'
import toast          from 'react-hot-toast'
import { businessService } from '@/shared/services'
import { formatDate }      from '@/shared/utils'
import { PageHeader, Button, Badge, EmptyState, Spinner, Modal, Input, Select } from '@/shared/components'
import type { Role }  from '@/shared/types'

const inviteSchema = z.object({
  email: z.string().email('Correo no válido'),
  role:  z.enum(['dueno', 'empleado']),
})
type InviteForm = z.infer<typeof inviteSchema>

export function EmployeesPage() {
  const qc = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: businessService.listMembers,
  })

  const invite = useMutation({
    mutationFn: ({ email, role }: { email: string; role: Role }) =>
      businessService.inviteMember(email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      setShowInvite(false)
      toast.success('Miembro agregado')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const remove = useMutation({
    mutationFn: businessService.removeMember,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); toast.success('Acceso removido') },
    onError: (err: Error) => toast.error(err.message),
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'empleado' },
  })

  const onClose = () => { setShowInvite(false); reset() }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Empleados"
        subtitle={`${members.length} miembro(s) en este negocio`}
        action={<Button onClick={() => setShowInvite(true)}>Agregar miembro</Button>}
      />

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : members.length === 0 ? (
        <EmptyState title="Sin miembros" description="Agrega empleados para que puedan registrar ventas." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised">
                {['Nombre', 'Correo', 'Rol', 'Desde', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.user_id} className="border-b border-border last:border-0 hover:bg-surface-raised">
                  <td className="px-4 py-3 text-sm font-medium text-text">{m.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-text-muted">{m.email}</td>
                  <td className="px-4 py-3">
                    <Badge color={m.role === 'dueno' ? 'blue' : 'green'}>
                      {m.role === 'dueno' ? 'Dueno' : 'Empleado'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted font-mono">
                    {m.joined_at ? formatDate(m.joined_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => {
                      if (window.confirm(`Remover acceso a ${m.name}?`)) remove.mutate(m.user_id)
                    }} className="text-xs text-danger hover:underline">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showInvite} onClose={onClose} title="Agregar miembro">
        <form onSubmit={handleSubmit(d => invite.mutate({ email: d.email, role: d.role as Role }))} className="space-y-4">
          <Input label="Correo electrónico" type="email" placeholder="empleado@ejemplo.com"
            error={errors.email?.message} {...register('email')} />
          <Select label="Rol" {...register('role')}>
            <option value="empleado">Empleado — solo registrar ventas</option>
            <option value="dueno">Dueno — acceso total</option>
          </Select>
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={invite.isPending}>Agregar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
