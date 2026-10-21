import EditGroupDiscountSettingsView from 'src/sections/group-discount-settings/edit-view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EditGroupDiscountSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/private-requests');

  return <EditGroupDiscountSettingsView />;
}
