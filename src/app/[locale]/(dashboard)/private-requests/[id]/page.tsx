import PrivateRequestDetailsView from '@/sections/private-requests/details-view';
import { requireInstructorRole } from 'src/utils/role-access';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function PrivateRequestDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;
  await requireInstructorRole(locale, '/session-requests');

  return <PrivateRequestDetailsView requestId={id} />;
}
