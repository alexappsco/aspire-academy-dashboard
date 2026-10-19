import AdminSessionRequestDetailsView from 'src/sections/admin-session-requests/details-view';
import { requireAdminRole } from 'src/utils/role-access';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function SessionRequestDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;
  await requireAdminRole(locale, `/private-requests/${id}`);

  return <AdminSessionRequestDetailsView requestId={id} />;
}
