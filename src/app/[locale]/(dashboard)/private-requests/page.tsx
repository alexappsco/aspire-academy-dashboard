import PrivateRequestsListView from '@/sections/private-requests/view';
import { requireInstructorRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivateRequestsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireInstructorRole(locale, '/session-requests');

  return <PrivateRequestsListView />;
}
