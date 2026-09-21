import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import StudentsListView from '@/sections/students/StudentsListView';
import { InstructorStudentsListView } from '@/sections/instructor-students';

export default async function StudentsPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';
  const isInstructor = role === 'instructor';

  if (isInstructor) {
    return <InstructorStudentsListView />;
  }

  return <StudentsListView />;
}
