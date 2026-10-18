'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { getCountriesAction } from 'src/actions/countries';
import {
  getHoursChargeRequests,
  getHoursChargeRequestStatusCounts,
} from 'src/actions/hours-charge-requests';
import { DEFAULT_LIMIT } from 'src/components/constant';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { CountryDto } from 'src/sections/countries/types';
import type {
  HoursChargeRequest,
  HoursChargeRequestStatusCounts,
} from 'src/types/hours-charge-request';

import { EMPTY_COUNTS } from '../constants';
import type { StatusFilter } from '../types';

export default function useHoursChargeRequests() {
  const t = useTranslations('HoursChargeRequests');
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(0, Number(searchParams.get('page') || 1) - 1);
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const [requests, setRequests] = useState<HoursChargeRequest[]>([]);
  const [counts, setCounts] = useState<HoursChargeRequestStatusCounts>(EMPTY_COUNTS);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [countryId, setCountryId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.replace(paths.hoursChargeRequests.root + '?' + params.toString());
  }, [router, searchParams]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  useEffect(() => {
    const loadLookups = async () => {
      const [countsResponse, countriesResponse] = await Promise.all([
        getHoursChargeRequestStatusCounts(),
        getCountriesAction({ SkipCount: 0, MaxResultCount: 1000 }),
      ]);

      if (countsResponse.success && countsResponse.data) {
        setCounts(countsResponse.data);
      }
      if (countriesResponse.success && countriesResponse.data) {
        setCountries(countriesResponse.data.items);
      }
    };

    loadLookups();
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);

    const response = await getHoursChargeRequests({
      Status: status === 'all' ? undefined : status,
      CountryId: countryId === 'all' ? undefined : countryId,
      FromDate: fromDate ? fromDate + 'T00:00:00' : undefined,
      Filter: debouncedSearch || undefined,
      SkipCount: page * limit,
      MaxResultCount: limit,
    });

    if (response.success && response.data) {
      setRequests(response.data.items);
      setTotalCount(response.data.totalCount);
    } else {
      setRequests([]);
      setTotalCount(0);
      toast.error(response.error || t('messages.load_error'));
    }

    setLoading(false);
  }, [countryId, debouncedSearch, fromDate, limit, page, status, t, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const changeStatus = (value: StatusFilter) => {
    setStatus(value);
    resetPage();
  };

  const changeCountry = (value: string) => {
    setCountryId(value);
    resetPage();
  };

  const changeDate = (value: string) => {
    setFromDate(value);
    resetPage();
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    resetPage();
  };

  return {
    requests,
    counts,
    countries,
    totalCount,
    status,
    countryId,
    fromDate,
    search,
    loading,
    changeStatus,
    changeCountry,
    changeDate,
    changeSearch,
  };
}