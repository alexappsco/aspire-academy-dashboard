import AcademyBankAccountsView from 'src/sections/academy-bank-accounts/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AcademyBankAccountsPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale, '/');
  return <AcademyBankAccountsView />;
}
