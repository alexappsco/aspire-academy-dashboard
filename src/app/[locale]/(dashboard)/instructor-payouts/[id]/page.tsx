import InstructorPayoutDetailsView from 'src/sections/instructor-payouts/details-view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function InstructorPayoutDetailsPage({ params }: PageProps) {
  const { locale, id } = await params;
  await requireAdminRole(locale, '/private-requests');

  return <InstructorPayoutDetailsView instructorId={id} />;
}
