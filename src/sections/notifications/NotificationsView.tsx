'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRouter, usePathname } from 'src/i18n/routing';
import { useToast } from 'src/components/toast';
import {
  getAdminNotificationsAction,
  deleteAdminNotificationAction,
} from 'src/actions/admin-notifications';
import { getStudents } from 'src/actions/students';
import type {
  AdminNotificationItemDto,
  GetAdminNotificationsParams,
} from 'src/types/admin-notification';

import NotificationsListView from './NotificationsListView';
import SendNotificationView from './SendNotificationView';

// Helper to compute ISO date range for period filter
function getDateRangeForPeriod(period: string): { FromDate?: string; ToDate?: string } {
  if (!period || period === 'all') return {};

  const now = new Date();
  if (period === 'today') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { FromDate: from.toISOString(), ToDate: to.toISOString() };
  }
  if (period === 'yesterday') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return { FromDate: from.toISOString(), ToDate: to.toISOString() };
  }
  if (period === 'this_week') {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { FromDate: from.toISOString(), ToDate: now.toISOString() };
  }
  if (period === 'this_month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return { FromDate: from.toISOString(), ToDate: now.toISOString() };
  }
  if (period === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { FromDate: from.toISOString(), ToDate: to.toISOString() };
  }
  if (period === 'last_3_months') {
    const from = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
    return { FromDate: from.toISOString(), ToDate: now.toISOString() };
  }
  return {};
}

export default function NotificationsView() {
  const t = useTranslations('Notifications');
  const toast = useToast();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const urlFilter = searchParams.get('Filter') || '';
  const urlUserId = searchParams.get('UserId') || 'all';
  const urlBroadcastParam = searchParams.get('IsBroadcast');
  const urlBroadcast =
    urlBroadcastParam === 'true' || urlBroadcastParam === 'broadcast'
      ? 'broadcast'
      : urlBroadcastParam === 'false' || urlBroadcastParam === 'specific'
        ? 'specific'
        : 'all';
  const urlType = searchParams.get('Type') || 'all';
  const urlPeriod = searchParams.get('period') || 'all';

  const [currentView, setCurrentView] = useState<'list' | 'send'>('list');
  const [notifications, setNotifications] = useState<AdminNotificationItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Users list for "المستخدم" select dropdown
  const [users, setUsers] = useState<Array<{ id: string; name: string; email?: string }>>([]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [userIdFilter, setUserIdFilter] = useState(urlUserId);
  const [broadcastFilter, setBroadcastFilter] = useState(urlBroadcast);
  const [typeFilter, setTypeFilter] = useState(urlType);
  const [datePeriodFilter, setDatePeriodFilter] = useState(urlPeriod);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search query
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Synchronize active filters with URL query parameters
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (debouncedSearch.trim()) {
      params.set('Filter', debouncedSearch.trim());
    }
    if (userIdFilter && userIdFilter !== 'all') {
      params.set('UserId', userIdFilter);
    }
    if (broadcastFilter === 'broadcast') {
      params.set('IsBroadcast', 'true');
    } else if (broadcastFilter === 'specific') {
      params.set('IsBroadcast', 'false');
    }
    if (typeFilter && typeFilter !== 'all') {
      params.set('Type', typeFilter);
    }
    if (datePeriodFilter && datePeriodFilter !== 'all') {
      params.set('period', datePeriodFilter);
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [
    debouncedSearch,
    userIdFilter,
    broadcastFilter,
    typeFilter,
    datePeriodFilter,
    pathname,
    router,
    searchParams,
  ]);

  // Load students/users once on mount
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await getStudents({ SkipCount: 0, MaxResultCount: 1000 });
        if (res.success && res.data?.items) {
          setUsers(
            res.data.items.map((st) => ({
              id: st.userId || st.id,
              name: st.name || st.email,
              email: st.email,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load users for notifications filter:', err);
      }
    }
    loadUsers();
  }, []);

  // Fetch notifications from Backend API
  const fetchData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const { FromDate, ToDate } = getDateRangeForPeriod(datePeriodFilter);

        const params: GetAdminNotificationsParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (debouncedSearch.trim()) {
          params.Filter = debouncedSearch.trim();
        }

        if (userIdFilter && userIdFilter !== 'all') {
          params.UserId = userIdFilter;
        }

        if (typeFilter && typeFilter !== 'all') {
          params.Type = typeFilter;
        }

        if (broadcastFilter === 'broadcast') {
          params.IsBroadcast = true;
        } else if (broadcastFilter === 'specific') {
          params.IsBroadcast = false;
        }

        if (FromDate) {
          params.FromDate = FromDate;
        }

        if (ToDate) {
          params.ToDate = ToDate;
        }

        const res = await getAdminNotificationsAction(params);

        if (res.success && res.data) {
          const rawItems = res.data.items || [];
          setNotifications(rawItems);
          setTotalCount(res.data.totalCount ?? rawItems.length);
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to load notifications');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, userIdFilter, typeFilter, broadcastFilter, datePeriodFilter, toast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteAdminNotificationAction(id);
      if (res.success) {
        toast.success(t('delete_success'));
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(res.error || t('delete_error'));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error(err instanceof Error ? err.message : t('delete_error'));
    }
  };

  const handleSendSuccess = () => {
    setCurrentView('list');
    fetchData(true);
  };

  if (currentView === 'send') {
    return (
      <SendNotificationView
        onCancel={() => setCurrentView('list')}
        onSuccess={handleSendSuccess}
      />
    );
  }

  return (
    <NotificationsListView
      data={notifications}
      loading={loading}
      totalCount={totalCount}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      userIdFilter={userIdFilter}
      onUserIdFilterChange={setUserIdFilter}
      users={users}
      broadcastFilter={broadcastFilter}
      onBroadcastFilterChange={setBroadcastFilter}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      datePeriodFilter={datePeriodFilter}
      onDatePeriodFilterChange={setDatePeriodFilter}
      onDelete={handleDelete}
      onNavigateToSend={() => setCurrentView('send')}
    />
  );
}
