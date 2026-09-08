import StudentCourseProgressView from '@/sections/students/StudentCourseProgressView';

interface PageProps {
  params: Promise<{
    id: string;
    courseId: string;
  }>;
}

export default async function StudentCourseProgressPage({ params }: PageProps) {
  const { id, courseId } = await params;
  return <StudentCourseProgressView studentId={id} courseId={courseId} />;
}
