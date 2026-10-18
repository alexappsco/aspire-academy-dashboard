import HoursChargeRequestDetailsView from 'src/sections/hours-charge-requests/details-view';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function HoursChargeRequestDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <HoursChargeRequestDetailsView requestId={id} />;
}