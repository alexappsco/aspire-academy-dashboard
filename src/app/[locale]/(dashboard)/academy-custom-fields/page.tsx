import AcademyCustomFieldsView from 'src/sections/academy-custom-fields/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AcademyCustomFieldsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/');
  return <AcademyCustomFieldsView />;
}
