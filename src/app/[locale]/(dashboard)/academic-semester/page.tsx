import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import type { AcademicSemestersListResponse } from 'src/types/semester';
import AcademicSemestersView from '@/sections/academic-semester/view';

export default async function AcademicSemestersPage() {
  const res = await getData<AcademicSemestersListResponse>(
    `${endpoints.semester.list}?SkipCount=0&MaxResultCount=1000`
  );

  const initialItems = res.success ? (res.data.items ?? []) : [];
  const initialTotal = res.success ? (res.data.totalCount ?? 0) : 0;

  return <AcademicSemestersView initialItems={initialItems} initialTotal={initialTotal} />;
}
