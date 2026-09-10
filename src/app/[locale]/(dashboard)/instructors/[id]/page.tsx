import InstructorDetailsView from 'src/sections/instructors/InstructorDetailsView';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InstructorDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <InstructorDetailsView instructorId={id} />;
}
