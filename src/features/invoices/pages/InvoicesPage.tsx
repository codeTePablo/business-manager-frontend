import { PageHeader, EmptyState, Button } from '@/shared/components'

export function InvoicesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Facturas"
        subtitle="Registro de gastos y compras de mercancia"
        action={<Button>Nuevo gasto</Button>}
      />
      <EmptyState
        title="Modulo en construccion"
        description="Los gastos y compras de mercancia se registraran aqui en la siguiente fase."
      />
    </div>
  )
}
