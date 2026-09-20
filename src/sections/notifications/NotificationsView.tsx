'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { useToast } from 'src/components/toast';
import {
  getAdminNotificationsAction,
  deleteAdminNotificationAction,
} from 'src/actions/admin-notifications';
import type { AdminNotificationItemDto } from 'src/types/admin-notification';

import NotificationsListView from './NotificationsListView';
import SendNotificationView from './SendNotificationView';

export default function NotificationsView() {
  const t = useTranslations('Notifications');
  const toast = useToast();

  const [currentView, setCurrentView] = useState<'list' | 'send'>('list');
  const [notifications, setNotifications] = useState<AdminNotificationItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [broadcastFilter, setBroadcastFilter] = useState('all');

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const fetchData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const params: Record<string, unknown> = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (debouncedSearch.trim()) {
          params.Filter = debouncedSearch.trim();
        }

        if (typeFilter !== 'all') {
          params.Type = typeFilter;
        }

        if (broadcastFilter === 'broadcast') {
          params.IsBroadcast = true;
        } else if (broadcastFilter === 'specific') {
          params.IsBroadcast = false;
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
    [debouncedSearch, typeFilter, broadcastFilter, toast]
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
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      broadcastFilter={broadcastFilter}
      onBroadcastFilterChange={setBroadcastFilter}
      onDelete={handleDelete}
      onNavigateToSend={() => setCurrentView('send')}
    />
  );
}
