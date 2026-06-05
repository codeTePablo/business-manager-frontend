import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth, RequireRole } from '@/shared/guards/guards'
import { AppLayout }  from '@/shared/layouts/AppLayout'
import { AuthLayout } from '@/shared/layouts/AuthLayout'
import { LoginPage }          from '@/features/auth/pages/LoginPage'
import { SelectBusinessPage } from '@/features/auth/pages/SelectBusinessPage'
import { DashboardPage }      from '@/features/dashboard/pages/DashboardPage'
import { SalesPage }          from '@/features/sales/pages/SalesPage'
import { NewSalePage }        from '@/features/sales/pages/NewSalePage'
import { SaleDetailPage }     from '@/features/sales/pages/SaleDetailPage'
import { RegisterSalePage }   from '@/features/sales/pages/RegisterSalePage'
import { EmployeesPage }      from '@/features/employees/pages/EmployeesPage'
import { InvoicesPage }       from '@/features/invoices/pages/InvoicesPage'
import { NotificationsPage }  from '@/features/notifications/pages/NotificationsPage'
import { useAuthStore }       from '@/shared/store/authStore'
import { IotDashboardPage } from '@/features/iot/pages/IotDashboardPage'

function RootRedirect() {
  const role = useAuthStore(s => s.user?.role)
  if (!role) return <Navigate to="/login" replace />
  return role === 'dueno'
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/register-sale" replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/select-business" element={<SelectBusinessPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allowed="dueno" />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/sales"         element={<SalesPage />} />
              <Route path="/sales/new"     element={<NewSalePage />} />
              <Route path="/sales/:id"     element={<SaleDetailPage />} />
              <Route path="/employees"     element={<EmployeesPage />} />
              <Route path="/invoices"      element={<InvoicesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/iot"           element={<IotDashboardPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allowed="empleado" />}>
            <Route element={<AppLayout minimal />}>
              <Route path="/register-sale" element={<RegisterSalePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
