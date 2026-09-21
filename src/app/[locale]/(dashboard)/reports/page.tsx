import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import ReportsView from '@/sections/reports/view';
import { InstructorReportsView } from '@/sections/instructor-reports';

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';

  const isInstructor = role === 'instructor';

  if (isInstructor) {
    return <InstructorReportsView />;
  }

  return <ReportsView />;
}