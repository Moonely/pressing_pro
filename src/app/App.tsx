import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RequireRole } from "@/routes/RequireRole";
import { TenantResolver } from "@/routes/TenantResolver";
import { AppShell } from "@/layouts/AppShell";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { OrderDetailPage } from "@/features/orders/pages/OrderDetailPage";
import { NewOrderPage } from "@/features/orders/pages/NewOrderPage";
import { PaymentsPage } from "@/features/payments/pages/PaymentsPage";
import { MachinesPage } from "@/features/machines/pages/MachinesPage";
import { StatsPage } from "@/features/stats/pages/StatsPage";
import { TenantsAdminPage } from "@/features/tenants/pages/TenantsAdminPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";

export default function App() {
  return (
    <TenantResolver>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<NewOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/machines" element={<MachinesPage />} />
            <Route path="/stats" element={<StatsPage />} />

            {/* Platform admin — SUPER_ADMIN only */}
            <Route element={<RequireRole roles="SUPER_ADMIN" />}>
              <Route path="/admin/tenants" element={<TenantsAdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </TenantResolver>
  );
}
