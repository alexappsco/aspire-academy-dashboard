import PackageFormView from 'src/sections/packages/form-view';

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PackageFormView packageId={id} />;
}
