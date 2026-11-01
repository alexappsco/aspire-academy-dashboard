import OrdersView from 'src/sections/orders/view';
import { requireAdminRole } from 'src/utils/role-access';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OrdersPage({ params }: PageProps) {
  const { locale } = await params;
  await requireAdminRole(locale);

  return <OrdersView />;
}
