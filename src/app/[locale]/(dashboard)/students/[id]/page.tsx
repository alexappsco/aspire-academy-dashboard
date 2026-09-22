import { cookies } from 'next/headers';
import { COOKIES_KEYS } from 'src/config-global';
import StudentDetailsView from '@/sections/students/StudentDetailsView';
import { InstructorStudentDetailsView } from '@/sections/instructor-students';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(COOKIES_KEYS.role)?.value;
  const role = rawRole ? decodeURIComponent(rawRole).trim().toLowerCase() : '';
  const isInstructor = role === 'instructor';

  if (isInstructor) {
    return <InstructorStudentDetailsView studentId={id} />;
  }

  return <StudentDetailsView studentId={id} />;
}
