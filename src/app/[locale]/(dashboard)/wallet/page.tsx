import InstructorWalletView from 'src/sections/instructor-wallet/view';
import { requireInstructorRole } from 'src/utils/role-access';
import { paths } from 'src/routes/paths';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InstructorWalletPage({ params }: PageProps) {
  const { locale } = await params;
  await requireInstructorRole(locale, paths.instructorPayouts.root);

  return <InstructorWalletView />;
}
