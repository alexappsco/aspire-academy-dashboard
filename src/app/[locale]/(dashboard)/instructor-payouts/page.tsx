import InstructorPayoutsView from 'src/sections/instructor-payouts/view';
import { requireAdminRole } from 'src/utils/role-access';
import { paths } from 'src/routes/paths';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InstructorPayoutsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, paths.wallet);

  return <InstructorPayoutsView />;
}
