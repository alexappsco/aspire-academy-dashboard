import DashboardLayout from "src/layouts/DashboardLayout";
import { RequireAuth } from "src/components/auth/AuthGuard";

export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
}
