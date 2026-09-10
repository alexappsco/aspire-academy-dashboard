import EditCourseView from '@/sections/courses/EditCourseView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const { id } = await params;
  return <EditCourseView id={id} />;
}