import NewMinutesManagementView from 'src/sections/minutes-management/new/new-minutes-management-view';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMinutesPage({ params }: PageProps) {
  const { id } = await params;
  return <NewMinutesManagementView id={id} />;
}
