import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import SubjectsView from 'src/sections/subjects/view';
import { InstructorSubjectsView } from 'src/sections/subjects/instructor';

export const metadata = {
  title: 'Subjects',
};

export default async function SubjectsPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';
  const isInstructor = role === 'instructor';

  if (isInstructor) {
    return <InstructorSubjectsView />;
  }

  return <SubjectsView />;
}
