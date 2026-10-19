import AdminSessionRequestsView from 'src/sections/admin-session-requests/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SessionRequestsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/private-requests');

  return <AdminSessionRequestsView />;
}
