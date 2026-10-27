'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { getAdminSessionRequests } from 'src/actions/admin-session-requests';
import { DEFAULT_LIMIT } from 'src/components/constant';
import { useToast } from 'src/components/toast';
import { useSessionRequestsHub } from 'src/hooks/use-session-requests-hub';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type {
  AdminSessionRequest,
  AdminSessionRequestStatusCounts,
  AdminSessionRequestType,
} from 'src/types/admin-session-request';

import { EMPTY_COUNTS, SESSION_REQUEST_STATUSES } from '../constants';
import type { AdminSessionStatusFilter } from '../types';

export default function useAdminSessionRequests() {
  const t = useTranslations('AdminSessionRequests');
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(0, Number(searchParams.get('page') || 1) - 1);
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const [requests, setRequests] = useState<AdminSessionRequest[]>([]);
  const [counts, setCounts] = useState<AdminSessionRequestStatusCounts>(EMPTY_COUNTS);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<AdminSessionStatusFilter>('all');
  const [requestKind, setRequestKind] = useState<'all' | 'Individual' | 'Group'>('all');
  const [type, setType] = useState<'all' | AdminSessionRequestType>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.replace(`${paths.adminSessionRequests.root}?${params.toString()}`);
  }, [router, searchParams]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadCounts = useCallback(async () => {
    const responses = await Promise.all(
      SESSION_REQUEST_STATUSES.map((item) =>
        getAdminSessionRequests({ Status: item, SkipCount: 0, MaxResultCount: 1 })
      )
    );

    const nextCounts = { ...EMPTY_COUNTS };
    SESSION_REQUEST_STATUSES.forEach((item, index) => {
      const response = responses[index];
      nextCounts[item] = response.success && response.data ? response.data.totalCount : 0;
    });
    nextCounts.total = SESSION_REQUEST_STATUSES.reduce(
      (sum, item) => sum + nextCounts[item],
      0
    );
    setCounts(nextCounts);
  }, []);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const fetchRequests = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setLoading(true);
      const response = await getAdminSessionRequests({
        Status: status === 'all' ? undefined : status,
        Type: type === 'all' ? undefined : type,
        PartyType: requestKind === 'all' ? undefined : requestKind,
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
        if (!options?.silent) {
          toast.error(response.error || t('messages.load_error'));
        }
      }
      if (!options?.silent) setLoading(false);
    },
    [debouncedSearch, limit, page, requestKind, status, t, toast, type]
  );

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const { status: realtimeStatus } = useSessionRequestsHub('admin', () => {
    void fetchRequests({ silent: true });
    void loadCounts();
  });

  const changeStatus = (value: AdminSessionStatusFilter) => {
    setStatus(value);
    resetPage();
  };

  const changeType = (value: 'all' | AdminSessionRequestType) => {
    setType(value);
    resetPage();
  };

  const changeRequestKind = (value: 'all' | 'Individual' | 'Group') => {
    setRequestKind(value);
    resetPage();
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    resetPage();
  };

  return {
    requests,
    counts,
    totalCount,
    status,
    requestKind,
    type,
    search,
    loading,
    realtimeStatus,
    changeStatus,
    changeRequestKind,
    changeType,
    changeSearch,
  };
}
