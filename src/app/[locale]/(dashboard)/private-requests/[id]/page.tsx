import PrivateRequestDetailsView from '@/sections/private-requests/details-view';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrivateRequestDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <PrivateRequestDetailsView requestId={id} />;
}
