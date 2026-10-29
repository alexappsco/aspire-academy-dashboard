import SubjectsView from 'src/sections/subjects/view';
import { requireAdminRole } from 'src/utils/role-access';

export const metadata = {
  title: 'Subjects',
};

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function SubjectsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/private-requests');

  return <SubjectsView />;
}
