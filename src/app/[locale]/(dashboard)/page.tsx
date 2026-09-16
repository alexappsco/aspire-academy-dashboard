import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import { HomeView } from 'src/sections/home';
import { InstructorHomeView } from 'src/sections/instructor-home';

export default async function Home() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';

  const isInstructor = role === 'instructor' || role === 'teacher';

  if (isInstructor) {
    return <InstructorHomeView />;
  }

  return <HomeView />;
}

