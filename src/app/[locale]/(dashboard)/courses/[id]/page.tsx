import CourseDetailsView from '@/sections/courses/CourseDetailsView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <CourseDetailsView id={id} />;
}
