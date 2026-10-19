import { getDashboardRole } from 'src/utils/role-access';
import type { LocaleType } from 'src/i18n/config-locale';
import { redirect } from 'src/i18n/routing';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function SessionRequestDetailsPage({ params }: PageProps) {
  const { id, locale } = await params;
  const role = await getDashboardRole();

  redirect({
    href: role === 'instructor' ? `/private-requests/${id}` : '/session-requests',
    locale: locale as LocaleType,
  });
}
