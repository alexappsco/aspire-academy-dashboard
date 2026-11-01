'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { approveOrder, getOrders, rejectOrder } from 'src/actions/orders';
import { DEFAULT_LIMIT } from 'src/components/constant';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { OrderDto } from 'src/types/order';

export type OrderStatusFilter = 'all' | 'Pending' | 'Paid' | 'Cancelled';

export default function useOrders() {
  const t = useTranslations('StudentOrders');
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(0, Number(searchParams.get('page') || 1) - 1);
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<OrderStatusFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<OrderDto | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const resetPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.replace(paths.orders + '?' + params.toString());
  }, [router, searchParams]);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    const response = await getOrders({
      Status: status === 'all' ? undefined : status,
      Filter: debouncedSearch || undefined,
      SkipCount: page * limit,
      MaxResultCount: limit,
    });

    if (response.success && response.data) {
      setOrders(response.data.items);
      setTotalCount(response.data.totalCount);
    } else {
      setOrders([]);
      setTotalCount(0);
      toast.error(response.error || t('messages.load_error'));
    }

    setLoading(false);
  }, [debouncedSearch, limit, page, status, t, toast, refreshKey]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const changeStatus = (value: OrderStatusFilter) => {
    setStatus(value);
    resetPage();
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const refresh = () => setRefreshKey((k) => k + 1);

  const openRejectDialog = (order: OrderDto) => {
    setRejectTarget(order);
    setRejectReason('');
  };

  const closeRejectDialog = () => {
    setRejectTarget(null);
    setRejectReason('');
  };

  const setRejectLoadingState = (value: boolean) => setRejectLoading(value);

  const handleApprove = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await approveOrder(orderId);
      if (res.success) {
        toast.success(t('messages.approve_success'));
        refresh();
      } else {
        toast.error(res.error || t('messages.approve_error'));
      }
    } catch {
      toast.error(t('messages.approve_error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      const res = await rejectOrder(rejectTarget.id, rejectReason.trim());
      if (res.success) {
        toast.success(t('messages.reject_success'));
        closeRejectDialog();
        refresh();
      } else {
        toast.error(res.error || t('messages.reject_error'));
      }
    } catch {
      toast.error(t('messages.reject_error'));
    } finally {
      setRejectLoading(false);
    }
  };

  return {
    orders,
    totalCount,
    status,
    search,
    loading,
    actionLoadingId,
    setActionLoadingId,
    rejectTarget,
    rejectReason,
    setRejectReason,
    rejectLoading,
    setRejectLoadingState,
    changeStatus,
    changeSearch,
    refresh,
    handleApprove,
    handleReject,
    openRejectDialog,
    closeRejectDialog,
  };
}
