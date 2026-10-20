import InstructorPayoutsView from 'src/sections/instructor-payouts/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InstructorPayoutsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/private-requests');

  return <InstructorPayoutsView />;
}
