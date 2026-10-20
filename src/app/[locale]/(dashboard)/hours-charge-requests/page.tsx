import HoursChargeRequestsView from 'src/sections/hours-charge-requests/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HoursChargeRequestsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale);

  return <HoursChargeRequestsView />;
}
