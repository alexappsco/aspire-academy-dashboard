'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { getPackages } from 'src/actions/packages';
import { getSpecializations } from 'src/actions/specializations';
import { DEFAULT_LIMIT } from 'src/components/constant';
import { useToast } from 'src/components/toast';
import { usePathname, useRouter } from 'src/i18n/routing';
import type { PackageSummary } from 'src/types/package';

import PackagesFilters, { type PackageStatusFilter } from './components/packages-filters';
import PackagesHeader from './components/packages-header';
import PackagesTable from './components/packages-table';

type SpecializationOption = { id: string; name: string };

export default function PackagesView() {
  const t = useTranslations('Packages');
  const locale = useLocale();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specializationId, setSpecializationId] = useState('');
  const [coursesCount, setCoursesCount] = useState('');
  const [status, setStatus] = useState<PackageStatusFilter>('all');

  const resetPage = useCallback(() => {
    if (page === 1) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [page, pathname, router, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadSpecializations = async () => {
      const response = await getSpecializations({ IsActive: true, MaxResultCount: 1000 });
      if (!response.success || !response.data) return;
      setSpecializations(
        response.data.items.map((item) => ({
          id: item.id,
          name: (locale === 'ar' ? item.nameAr : item.nameEn) || item.nameAr || item.nameEn,
        }))
      );
    };
    void loadSpecializations();
  }, [locale]);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    const response = await getPackages({
      Filter: debouncedSearch || undefined,
      SpecializationId: specializationId || undefined,
      CoursesCount: coursesCount ? Number(coursesCount) : undefined,
      IsActive: status === 'all' ? undefined : status === 'active',
      SkipCount: (page - 1) * limit,
      MaxResultCount: limit,
    });

    if (response.success && response.data) {
      setPackages(response.data.items || []);
      setTotalCount(response.data.totalCount || 0);
    } else {
      setPackages([]);
      setTotalCount(0);
      toast.error(response.error || t('messages.load_error'));
    }
    setLoading(false);
  }, [coursesCount, debouncedSearch, limit, page, specializationId, status, t, toast]);

  useEffect(() => {
    void loadPackages();
  }, [loadPackages]);

  const specializationOptions = useMemo(() => specializations, [specializations]);

  return (
    <Stack gap={0}>
      <PackagesHeader />
      <Card sx={{ overflow: 'hidden' }}>
        <PackagesFilters
          search={search}
          specializationId={specializationId}
          coursesCount={coursesCount}
          status={status}
          specializationOptions={specializationOptions}
          onSearchChange={(value) => { setSearch(value); resetPage(); }}
          onSpecializationChange={(value) => { setSpecializationId(value); resetPage(); }}
          onCoursesCountChange={(value) => { setCoursesCount(value); resetPage(); }}
          onStatusChange={(value) => { setStatus(value); resetPage(); }}
        />
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 280 }}>
            <CircularProgress size={32} />
          </Stack>
        ) : (
          <PackagesTable packages={packages} totalCount={totalCount} />
        )}
      </Card>
    </Stack>
  );
}
