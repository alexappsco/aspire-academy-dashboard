import AcademyCustomFieldsView from 'src/sections/academy-custom-fields/view';
import { requireInstructorRole } from 'src/utils/role-access';

type PageProps = { params: Promise<{ locale: string }> };

export default async function InstructorCustomFieldsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireInstructorRole(locale, '/');
  return <AcademyCustomFieldsView scope="instructor" />;
}
