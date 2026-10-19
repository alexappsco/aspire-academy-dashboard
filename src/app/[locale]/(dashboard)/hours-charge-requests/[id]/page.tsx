import HoursChargeRequestDetailsView from 'src/sections/hours-charge-requests/details-view';
import { requireAdminRole } from 'src/utils/role-access';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function HoursChargeRequestDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;
  await requireAdminRole(locale);

  return <HoursChargeRequestDetailsView requestId={id} />;
}
