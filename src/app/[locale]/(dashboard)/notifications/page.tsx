import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import NotificationsView from 'src/sections/notifications/NotificationsView';
import InstructorNotificationsView from 'src/sections/instructor-notifications/view';

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';
  const isInstructor = role === 'instructor';

  if (isInstructor) {
    return <InstructorNotificationsView />;
  }

  return <NotificationsView />;
}
