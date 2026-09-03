import { getData } from 'src/utils/crud-fetch-api';
import CategoryView from 'src/sections/category/view';
import type { FieldsListResponse } from '@/types/category';

export default async function CategoryPage() {
  const res = await getData<FieldsListResponse>(
    '/admin/fields?SkipCount=0&MaxResultCount=1000'
  );

  const initialItems = res.success ? (res.data.items ?? []) : [];
  const initialTotal = res.success ? (res.data.totalCount ?? 0) : 0;

  return <CategoryView initialItems={initialItems} initialTotal={initialTotal} />;
}
