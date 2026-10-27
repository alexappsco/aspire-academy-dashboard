import DashboardLayout from "src/layouts/DashboardLayout";
import { RequireAuth } from "src/components/auth/AuthGuard";
import { NotificationsProvider } from "src/contexts/NotificationsContext";

export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <NotificationsProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </NotificationsProvider>
    </RequireAuth>
  );
}
