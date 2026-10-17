'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import TablePagination from '@mui/material/TablePagination';
import Skeleton from '@mui/material/Skeleton';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/routing';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import {
  getInstructorSessionSettingsAction,
  updateInstructorSessionSettingsAction,
  getSessionRequestsAction,
} from 'src/actions';
import {
  InstructorSessionSettingsDto,
  SessionRequestInstructorResult,
  SessionRequestStatus,
  SessionType,
} from 'src/types/private-request';
import ServiceToggleCards from './components/ServiceToggleCards';

// Format backend ISO date to locale readable format
function formatRequestDate(dateStr?: string, locale = 'ar'): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

// Normalize backend status (numbers 1..6 or string names) to canonical status
export function normalizeSessionStatus(
  status: unknown
): 'Pending' | 'AwaitingAdminReview' | 'Active' | 'Completed' | 'Rejected' | 'Cancelled' {
  if (status === 1 || status === '1' || String(status).toLowerCase() === 'pending') {
    return 'Pending';
  }
  if (status === 2 || status === '2' || String(status).toLowerCase() === 'awaitingadminreview') {
    return 'AwaitingAdminReview';
  }
  if (status === 3 || status === '3' || String(status).toLowerCase() === 'active') {
    return 'Active';
  }
  if (status === 4 || status === '4' || String(status).toLowerCase() === 'completed') {
    return 'Completed';
  }
  if (status === 5 || status === '5' || String(status).toLowerCase() === 'rejected') {
    return 'Rejected';
  }
  if (status === 6 || status === '6' || String(status).toLowerCase() === 'cancelled') {
    return 'Cancelled';
  }
  return 'Pending';
}

// Render status badge chip
function renderStatusChip(status: unknown, t: any) {
  const normalized = normalizeSessionStatus(status);

  switch (normalized) {
    case 'Pending':
      return (
        <Chip
          label={t('tabs.pending')}
          size="small"
          sx={{
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    case 'AwaitingAdminReview':
      return (
        <Chip
          label={t('tabs.awaiting_admin')}
          size="small"
          sx={{
            bgcolor: '#FEF3C7',
            color: '#D97706',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    case 'Active':
      return (
        <Chip
          label={t('tabs.active')}
          size="small"
          sx={{
            bgcolor: '#DCFCE7',
            color: '#15803D',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    case 'Completed':
      return (
        <Chip
          label={t('tabs.completed')}
          size="small"
          sx={{
            bgcolor: '#E2E8F0',
            color: '#334155',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    case 'Rejected':
      return (
        <Chip
          label={t('tabs.rejected')}
          size="small"
          sx={{
            bgcolor: '#FEE2E2',
            color: '#DC2626',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    case 'Cancelled':
      return (
        <Chip
          label={t('tabs.cancelled')}
          size="small"
          sx={{
            bgcolor: '#F1F5F9',
            color: '#64748B',
            fontWeight: 700,
            fontSize: 12,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    default:
      return (
        <Chip
          label={String(status)}
          size="small"
          sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: 12, height: 24 }}
        />
      );
  }
}

export default function PrivateRequestsListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const t = useTranslations('PrivateRequests');
  const locale = useLocale();

  // Read initial values from URL query parameters
  const urlStatus = searchParams.get('Status') || 'all';
  const urlType = searchParams.get('Type') || 'all';
  const urlFilter = searchParams.get('Filter') || '';
  const urlPage = parseInt(searchParams.get('page') || '0', 10);

  // Tab state (mapped to StatusEnum or 'all')
  const initialTab = useMemo(() => {
    if (!urlStatus || urlStatus === 'all') return 'all';
    const norm = normalizeSessionStatus(urlStatus);
    if (['Pending', 'AwaitingAdminReview', 'Active', 'Completed'].includes(norm)) {
      return norm;
    }
    return 'all';
  }, [urlStatus]);

  const [currentTab, setCurrentTab] = useState<SessionRequestStatus | 'all'>(initialTab);

  // Filter Bar States
  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'Recorded' | 'Live'>(
    urlType === 'Live' || urlType === 'Recorded' ? urlType : 'all'
  );
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);

  // Backend session settings state (Top Cards)
  const [sessionSettings, setSessionSettings] = useState<InstructorSessionSettingsDto | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [updatingRecorded, setUpdatingRecorded] = useState(false);
  const [updatingLive, setUpdatingLive] = useState(false);

  // Requests Table Data & Pagination States
  const [requests, setRequests] = useState<SessionRequestInstructorResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [page, setPage] = useState(isNaN(urlPage) ? 0 : urlPage);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Action Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // 1. Debounce Search Input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Sync URL parameters with current active filters
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    // Status: Prioritize tab if not 'all', otherwise check dropdown
    const effectiveStatus =
      currentTab !== 'all' ? currentTab : statusFilter !== 'all' ? statusFilter : null;

    if (effectiveStatus) {
      params.set('Status', String(effectiveStatus));
    }

    if (serviceTypeFilter !== 'all') {
      params.set('Type', serviceTypeFilter);
    }

    if (debouncedSearch.trim()) {
      params.set('Filter', debouncedSearch.trim());
    }

    if (page > 0) {
      params.set('page', String(page));
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [currentTab, statusFilter, serviceTypeFilter, debouncedSearch, page, pathname, router, searchParams]);

  // 3. Fetch Session Settings for top toggle cards
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    const res = await getInstructorSessionSettingsAction();
    if (res.success && res.data) {
      setSessionSettings(res.data);
    } else {
      setSessionSettings({
        acceptsLiveSessions: false,
        acceptsRecordedSessions: false,
        liveSessionsCount: 0,
        recordedSessionsCount: 0,
      });
    }
    setLoadingSettings(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 4. Fetch Session Requests for Table from Backend API
  const fetchRequests = useCallback(async () => {
    setTableLoading(true);

    const effectiveStatus =
      currentTab !== 'all' ? currentTab : statusFilter !== 'all' ? (statusFilter as SessionRequestStatus) : undefined;

    const effectiveType =
      serviceTypeFilter !== 'all' ? (serviceTypeFilter as SessionType) : undefined;

    const res = await getSessionRequestsAction({
      Status: effectiveStatus,
      Type: effectiveType,
      Filter: debouncedSearch.trim() || undefined,
      SkipCount: page * rowsPerPage,
      MaxResultCount: rowsPerPage,
    });

    if (res.success && res.data) {
      setRequests(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } else {
      setRequests([]);
      setTotalCount(0);
      if (res.error) {
        toast.error(res.error);
      }
    }

    setTableLoading(false);
  }, [currentTab, statusFilter, serviceTypeFilter, debouncedSearch, page, rowsPerPage, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Toggle Recorded Sessions (Optimistic UI)
  const handleToggleRecorded = async () => {
    if (!sessionSettings) return;
    const current = sessionSettings.acceptsRecordedSessions;
    const nextVal = !current;
    setUpdatingRecorded(true);

    setSessionSettings((prev) =>
      prev ? { ...prev, acceptsRecordedSessions: nextVal } : prev
    );

    const res = await updateInstructorSessionSettingsAction({
      acceptsRecordedSessions: nextVal,
      acceptsLiveSessions: sessionSettings.acceptsLiveSessions,
    });

    setUpdatingRecorded(false);

    if (res.success) {
      toast.success(
        nextVal
          ? t('notifications.recorded_enabled')
          : t('notifications.recorded_disabled')
      );
    } else {
      setSessionSettings((prev) =>
        prev ? { ...prev, acceptsRecordedSessions: current } : prev
      );
      toast.error(res.error || t('notifications.recorded_failed'));
    }
  };

  // Toggle Live Sessions (Optimistic UI)
  const handleToggleLive = async () => {
    if (!sessionSettings) return;
    const current = sessionSettings.acceptsLiveSessions;
    const nextVal = !current;
    setUpdatingLive(true);

    setSessionSettings((prev) =>
      prev ? { ...prev, acceptsLiveSessions: nextVal } : prev
    );

    const res = await updateInstructorSessionSettingsAction({
      acceptsRecordedSessions: sessionSettings.acceptsRecordedSessions,
      acceptsLiveSessions: nextVal,
    });

    setUpdatingLive(false);

    if (res.success) {
      toast.success(
        nextVal
          ? t('notifications.live_enabled')
          : t('notifications.live_disabled')
      );
    } else {
      setSessionSettings((prev) =>
        prev ? { ...prev, acceptsLiveSessions: current } : prev
      );
      toast.error(res.error || t('notifications.live_failed'));
    }
  };

  // Navigate to details
  const handleNavigateToDetails = useCallback(
    (id: string) => {
      setMenuAnchorEl(null);
      setSelectedRequestId(null);
      router.push(`/private-requests/${id}`);
    },
    [router]
  );

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedRequestId(id);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedRequestId(null);
  };

  // Tab change handler
  const handleTabChange = (_: React.SyntheticEvent, val: SessionRequestStatus | 'all') => {
    setCurrentTab(val);
    setStatusFilter(String(val));
    setPage(0);
  };

  return (
    <Box sx={{ py: 2, pb: 8 }}>
      {/* 1. Page Title */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: { xs: 22, md: 26 },
          }}
        >
          {t('title')}
        </Typography>
      </Stack>

      {/* 2. Top Toggle Cards: Private Recorded & Private Live (Bound to Backend API) */}
      <ServiceToggleCards
        settings={sessionSettings}
        loading={loadingSettings}
        onToggleRecorded={handleToggleRecorded}
        onToggleLive={handleToggleLive}
        isUpdatingRecorded={updatingRecorded}
        isUpdatingLive={updatingLive}
      />

      {/* 3. Main Card with Tabs & Filters & Table */}
      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Top Tabs with counts */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 52,
              '& .MuiTab-root': {
                minHeight: 52,
                fontWeight: 700,
                fontSize: 14,
                px: 2,
              },
              '& .Mui-selected': {
                color: '#0F172A !important',
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#0F172A',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab
              value="all"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  {currentTab === 'all' && (
                    <Chip
                      label={totalCount}
                      size="small"
                      sx={{
                        bgcolor: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  )}
                  <span>{t('tabs.all')}</span>
                </Stack>
              }
            />
            <Tab
              value="Pending"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  {currentTab === 'Pending' && (
                    <Chip
                      label={totalCount}
                      size="small"
                      sx={{
                        bgcolor: '#E0F2FE',
                        color: '#0284C7',
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  )}
                  <span>{t('tabs.pending')}</span>
                </Stack>
              }
            />
            <Tab
              value="AwaitingAdminReview"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  {currentTab === 'AwaitingAdminReview' && (
                    <Chip
                      label={totalCount}
                      size="small"
                      sx={{
                        bgcolor: '#FEF3C7',
                        color: '#D97706',
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  )}
                  <span>{t('tabs.awaiting_admin')}</span>
                </Stack>
              }
            />
            <Tab
              value="Active"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  {currentTab === 'Active' && (
                    <Chip
                      label={totalCount}
                      size="small"
                      sx={{
                        bgcolor: '#DCFCE7',
                        color: '#15803D',
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  )}
                  <span>{t('tabs.active')}</span>
                </Stack>
              }
            />
            <Tab
              value="Completed"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                  {currentTab === 'Completed' && (
                    <Chip
                      label={totalCount}
                      size="small"
                      sx={{
                        bgcolor: '#E2E8F0',
                        color: '#334155',
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  )}
                  <span>{t('tabs.completed')}</span>
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {/* Filter Controls Bar: Search on FAR RIGHT (First in RTL), Selects on LEFT */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Search Input: Far Right in RTL */}
          <TextField
            size="small"
            placeholder={t('filters.search_placeholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13.5 },
            }}
          />

          {/* Filters: Service Type, Status (Left side in RTL) */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1.5,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {/* Service Type Select */}
            <FormControl size="small" sx={{ width: { xs: 'calc(50% - 6px)', sm: 150 } }}>
              <Select
                value={serviceTypeFilter}
                onChange={(e) => {
                  setServiceTypeFilter(e.target.value as any);
                  setPage(0);
                }}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
              >
                <MenuItem value="all">{t('filters.all_types')}</MenuItem>
                <MenuItem value="Recorded">{t('filters.recorded')}</MenuItem>
                <MenuItem value="Live">{t('filters.live')}</MenuItem>
              </Select>
            </FormControl>

            {/* Status Select */}
            <FormControl size="small" sx={{ width: { xs: 'calc(50% - 6px)', sm: 150 } }}>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setStatusFilter(val);
                  if (['Pending', 'AwaitingAdminReview', 'Active', 'Completed'].includes(val)) {
                    setCurrentTab(val as SessionRequestStatus);
                  } else {
                    setCurrentTab('all');
                  }
                  setPage(0);
                }}
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: '#FFFFFF', fontSize: 13 }}
              >
                <MenuItem value="all">{t('filters.all_statuses')}</MenuItem>
                <MenuItem value="Pending">{t('tabs.pending')}</MenuItem>
                <MenuItem value="AwaitingAdminReview">{t('tabs.awaiting_admin')}</MenuItem>
                <MenuItem value="Active">{t('tabs.active')}</MenuItem>
                <MenuItem value="Completed">{t('tabs.completed')}</MenuItem>
                <MenuItem value="Rejected">{t('tabs.rejected')}</MenuItem>
                <MenuItem value="Cancelled">{t('tabs.cancelled')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Table Content: Column 1 on Right is Request ID, Column 7 on Left is Actions */}
        <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 800,
            }}
          >
            {/* Table Header */}
            <Box component="thead">
              <Box
                component="tr"
                sx={{
                  bgcolor: '#F8FAFC',
                  '& th': {
                    p: 2,
                    color: '#64748B',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'center',
                    borderBottom: '1px solid #F1F5F9',
                  },
                }}
              >
                <Box component="th" sx={{ textAlign: 'start !important', pr: 3, width: 140 }}>
                  {t('columns.request_id')}
                </Box>
                <Box component="th" sx={{ textAlign: 'start !important' }}>
                  {t('columns.student_scope')}
                </Box>
                <Box component="th">{t('columns.request_date')}</Box>
                <Box component="th">{t('columns.service_type')}</Box>
                <Box component="th" sx={{ textAlign: 'start !important', maxWidth: 300 }}>
                  {t('columns.desc_specialization')}
                </Box>
                <Box component="th">{t('columns.status')}</Box>
                <Box component="th" sx={{ width: 60 }}>{t('columns.actions')}</Box>
              </Box>
            </Box>

            {/* Table Body */}
            <Box component="tbody">
              {tableLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <Box component="tr" key={`skel-${idx}`} sx={{ borderBottom: '1px solid #F1F5F9' }}>
                    <Box component="td" sx={{ p: 2, pr: 3 }}>
                      <Skeleton width={100} height={20} />
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                         <Skeleton variant="circular" width={36} height={36} />
                        <Box>
                          <Skeleton width={120} height={18} />
                          <Skeleton width={80} height={14} />
                        </Box>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                      <Skeleton width={80} height={18} sx={{ mx: 'auto' }} />
                    </Box>
                    <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                      <Skeleton width={60} height={24} sx={{ mx: 'auto' }} />
                    </Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Skeleton width={200} height={18} />
                    </Box>
                    <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                      <Skeleton width={70} height={24} sx={{ mx: 'auto' }} />
                    </Box>
                    <Box component="td" sx={{ p: 2, textAlign: 'center' }}>
                      <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
                    </Box>
                  </Box>
                ))
              ) : requests.length === 0 ? (
                // Empty state
                <Box component="tr">
                  <Box component="td" colSpan={7} sx={{ py: 8, textAlign: 'center' }}>
                    <Box sx={{ maxWidth: 360, mx: 'auto', textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: '#F1F5F9',
                          color: '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <Iconify icon="solar:folder-open-broken" width={32} />
                      </Box>
                      <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1E293B' }}>
                        {t('empty.title')}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: '#64748B', mt: 0.5 }}>
                        {t('empty.desc')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                // Rows
                requests.map((req) => {
                  const isRec = req.type === 'Recorded' || (req.type as any) === 2 || (req.type as any) === '2';

                  return (
                    <Box
                      component="tr"
                      key={req.id}
                      onClick={() => handleNavigateToDetails(req.id)}
                      sx={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #F1F5F9',
                        '&:hover': { bgcolor: '#F8FAFC' },
                        '& td': { p: 2, fontSize: 13, textAlign: 'center' },
                      }}
                    >
                      {/* 1. Request ID (Far Right) */}
                      <Box
                        component="td"
                        sx={{
                          textAlign: 'start !important',
                          pr: 3,
                          fontWeight: 700,
                          color: '#0F172A',
                          fontFamily: 'monospace',
                        }}
                      >
                        #{req.id.slice(0, 8)}...
                      </Box>

                      {/* 2. Student & Scope */}
                      <Box component="td" sx={{ textAlign: 'start !important' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={req.student?.imageUrl || undefined}
                            alt={req.student?.name || 'Student'}
                            sx={{ width: 36, height: 36, bgcolor: '#E2E8F0', color: '#475569' }}
                          >
                            {(req.student?.name?.[0] || 'S').toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                              {req.student?.name || t('student_unknown')}
                            </Typography>
                            <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                              {req.isBroadcast ? t('broadcast') : t('direct')}
                              {req.student?.countryName ? ` • ${req.student.countryName}` : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* 3. Submitted Date */}
                      <Box component="td" sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                        {formatRequestDate(req.creationTime, locale)}
                      </Box>

                      {/* 4. Service Type */}
                      <Box component="td">
                        <Chip
                          icon={
                            <Iconify
                              icon={isRec ? 'solar:videocamera-record-bold' : 'solar:users-group-rounded-bold'}
                              width={14}
                            />
                          }
                          label={isRec ? t('filters.recorded') : t('filters.live')}
                          size="small"
                          sx={{
                            bgcolor: isRec ? '#EFF6FF' : '#EEF2FF',
                            color: isRec ? '#2563EB' : '#4F46E5',
                            fontWeight: 700,
                            fontSize: 11.5,
                            borderRadius: 1.5,
                            px: 1,
                            height: 24,
                            '& .MuiChip-icon': {
                              color: isRec ? '#2563EB' : '#4F46E5',
                              margin: '0 !important',
                              marginInlineEnd: '5px !important',
                            },
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                        />
                      </Box>

                      {/* 5. Description & Specialization */}
                      <Box
                        component="td"
                        sx={{
                          textAlign: 'start !important',
                          maxWidth: 280,
                        }}
                      >
                        <Typography
                          noWrap
                          sx={{
                            fontSize: 13,
                            color: '#334155',
                            fontWeight: 600,
                            maxWidth: 280,
                          }}
                        >
                          {req.description || t('no_description')}
                        </Typography>
                        {req.specializationName && (
                          <Typography sx={{ fontSize: 11.5, color: '#0284C7', mt: 0.25 }}>
                            {req.specializationName}
                          </Typography>
                        )}
                      </Box>

                      {/* 6. Status Badge */}
                      <Box component="td">
                        {renderStatusChip(req.status, t)}
                      </Box>

                      {/* 7. Actions Three Dots (Far Left) */}
                      <Box component="td" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, req.id)}
                          sx={{ color: '#94A3B8' }}
                        >
                          <Iconify icon="solar:menu-dots-bold" width={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage={t('rows_per_page')}
          rowsPerPageOptions={[5, 10, 20, 50]}
          sx={{
            borderTop: '1px solid #F1F5F9',
            '& .MuiTablePagination-toolbar': {
              minHeight: 52,
            },
          }}
        />
      </Card>

      {/* Row Action Popover Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8F0',
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedRequestId) {
              handleNavigateToDetails(selectedRequestId);
            }
          }}
          sx={{ fontSize: 13.5, fontWeight: 600, gap: 1.5 }}
        >
          <Iconify icon="solar:eye-bold" width={18} sx={{ color: '#2563EB' }} />
          {t('view_details')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
