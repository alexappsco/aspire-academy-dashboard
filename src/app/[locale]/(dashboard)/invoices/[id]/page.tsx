import InvoicePreviewView from 'src/sections/invoices/preview-view';
import { getInvoiceDetailsAction } from 'src/actions/invoices';
import { MOCK_INVOICES } from 'src/sections/invoices/_mock';
import type { InvoiceItem } from 'src/types/invoice';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function InvoiceDetailsPage({ params }: PageProps) {
  const { locale, id } = await params;
  await requireAdminRole(locale);

  let invoice: InvoiceItem | null = null;
  const res = await getInvoiceDetailsAction(id);
  if (res.success && res.data) {
    invoice = res.data;
  } else {
    invoice =
      MOCK_INVOICES.find((item) => item.id === id || item.invoiceNumber === id) ||
      MOCK_INVOICES[0];
  }

  return <InvoicePreviewView invoice={invoice} />;
}
