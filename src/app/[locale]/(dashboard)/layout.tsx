import DashboardLayout from "src/layouts/DashboardLayout";

export default function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
