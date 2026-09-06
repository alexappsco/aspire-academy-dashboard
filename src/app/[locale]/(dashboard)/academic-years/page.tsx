import { getData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import AcademicYearsView from 'src/sections/academic-years/view';
import type { AcademicYearsListResponse } from 'src/types/academic-year';

export default async function AcademicYearsPage() {
  const res = await getData<AcademicYearsListResponse>(
    `${endpoints.academicYear.list}?SkipCount=0&MaxResultCount=1000`
  );

  const initialItems = res.success ? (res.data.items ?? []) : [];
  const initialTotal = res.success ? (res.data.totalCount ?? 0) : 0;

  return <AcademicYearsView initialItems={initialItems} initialTotal={initialTotal} />;
}
