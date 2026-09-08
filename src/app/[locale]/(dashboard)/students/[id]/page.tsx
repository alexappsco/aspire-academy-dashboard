import StudentDetailsView from '@/sections/students/StudentDetailsView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <StudentDetailsView studentId={id} />;
}
