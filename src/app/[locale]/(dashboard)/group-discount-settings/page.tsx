import GroupDiscountSettingsView from 'src/sections/group-discount-settings/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function GroupDiscountSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/private-requests');

  return <GroupDiscountSettingsView />;
}
