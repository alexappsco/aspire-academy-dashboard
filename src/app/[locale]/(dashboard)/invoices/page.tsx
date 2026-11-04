import InvoicesView from 'src/sections/invoices/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InvoicesPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale);

  return <InvoicesView />;
}
