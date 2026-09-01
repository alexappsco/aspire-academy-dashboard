import SupportDetailsView from "src/sections/SupportView/details-view";

type SupportDetailsPageProps = {
  params: Promise<{ ticketId: string }>;
};

export default async function SupportDetailsPage({ params }: SupportDetailsPageProps) {
  const { ticketId } = await params;

  return <SupportDetailsView ticketId={ticketId} />;
}
