import PackageFormView from 'src/sections/packages/form-view';

export default async function PackageDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PackageFormView packageId={id} readOnly />;
}
