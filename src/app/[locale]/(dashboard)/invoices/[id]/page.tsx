import InvoicePreviewView from 'src/sections/invoices/preview-view';
import { MOCK_INVOICES } from 'src/sections/invoices/_mock';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function InvoiceDetailsPage({ params }: PageProps) {
  const { locale, id } = await params;
  await requireAdminRole(locale);

  const invoice =
    MOCK_INVOICES.find((item) => item.id === id || item.invoiceNumber === id) ||
    MOCK_INVOICES[0];

  return <InvoicePreviewView invoice={invoice} />;
}
