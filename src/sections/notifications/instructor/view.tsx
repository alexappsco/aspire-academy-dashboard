'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { useRouter, usePathname } from 'src/i18n/routing';
import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import {
  getInstructorNotificationsAction,
  getInstructorUnreadCountAction,
  markInstructorNotificationAsReadAction,
  markAllInstructorNotificationsAsReadAction,
} from 'src/actions/instructor-notifications';
import { getInstructorStudentsAction } from 'src/actions/instructor-students';
import type { InstructorStudentItemDto } from 'src/types/instructor-student';
import type { InstructorNotificationItemDto } from 'src/types/instructor-notification';
import { normalizeNotificationType } from 'src/types/admin-notification';

import SendCourseNotificationDialog from './SendCourseNotificationDialog';
import InstructorNotificationDetailsDialog from './InstructorNotificationDetailsDialog';

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

export default function InstructorNotificationsView() {
  const t = useTranslations('InstructorNotifications');
  const tTypes = useTranslations('Notifications.types');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const toast = useToast();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const urlFilter = searchParams.get('Filter') || '';
  const urlUserId = searchParams.get('UserId') || 'all';
  const urlType = searchParams.get('Type') || 'all';
  const urlPeriod = searchParams.get('period') || 'all';

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Notifications state
  const [items, setItems] = useState<InstructorNotificationItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Instructor Students for "المستخدم" select
  const [students, setStudents] = useState<InstructorStudentItemDto[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [userIdFilter, setUserIdFilter] = useState(urlUserId);
  const [datePeriodFilter, setDatePeriodFilter] = useState(urlPeriod);
  const [typeFilter, setTypeFilter] = useState(urlType);

  // Dialogs state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
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
  }, [debouncedSearch, userIdFilter, typeFilter, datePeriodFilter, pathname, router, searchParams]);

  // Load instructor students once on mount
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await getInstructorStudentsAction({ SkipCount: 0, MaxResultCount: 1000 });
        if (res.success && res.data?.items) {
          setStudents(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load instructor students:', err);
      }
    }
    loadStudents();
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getInstructorUnreadCountAction();
      if (res.success && typeof res.data === 'number') {
        setUnreadCount(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Fetch Notifications from Backend
  const fetchNotifications = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const { FromDate, ToDate } = getDateRangeForPeriod(datePeriodFilter);

        const res = await getInstructorNotificationsAction({
          Filter: debouncedSearch.trim() || undefined,
          UserId: userIdFilter !== 'all' ? userIdFilter : undefined,
          Type: typeFilter !== 'all' ? typeFilter : undefined,
          FromDate,
          ToDate,
          SkipCount: 0,
          MaxResultCount: 1000,
        });

        if (res.success && res.data) {
          setItems(res.data.items || []);
          setTotalCount(res.data.totalCount ?? (res.data.items?.length || 0));
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, userIdFilter, typeFilter, datePeriodFilter, toast]
  );

  // Trigger fetch when active backend filters change
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, [fetchNotifications, fetchUnreadCount]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllInstructorNotificationsAsReadAction();
      if (res.success) {
        toast.success(t('mark_all_read_success'));
        setUnreadCount(0);
        setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      } else {
        toast.error(res.error || 'Failed');
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Open Details & Mark single as read
  const handleOpenDetails = async (notification: InstructorNotificationItemDto) => {
    setSelectedNotificationId(notification.id);
    setDetailsOpen(true);

    if (!notification.isRead) {
      try {
        await markInstructorNotificationAsReadAction(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setItems((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeChip = (typeRaw: string | number) => {
    const norm = normalizeNotificationType(typeRaw);
    let label: string = norm;
    try {
      label = tTypes(norm);
    } catch {
      label = norm;
    }

    switch (norm) {
      case 'CoursePromo':
        return (
          <Chip
            size="small"
            label={label}
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      case 'PurchaseComplete':
        return (
          <Chip
            size="small"
            label={label}
            sx={{
              bgcolor: '#FEF3C7',
              color: '#D97706',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
      case 'General':
      default:
        return (
          <Chip
            size="small"
            label={label}
            sx={{
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
            }}
          />
        );
    }
  };

  // Table Heads
  const tableHead = [
    { id: 'image', label: '', align: 'center' as cellAlignment, width: 50 },
    { id: 'title', label: t('columns.title'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'message', label: t('columns.message'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'type', label: t('columns.type'), align: 'center' as cellAlignment, width: 140 },
    { id: 'status', label: t('columns.status'), align: 'center' as cellAlignment, width: 100 },
    { id: 'createdAt', label: t('columns.date'), align: 'center' as cellAlignment, width: 160 },
  ];

  const actions = [
    {
      label: t('actions.view'),
      icon: <Iconify icon="solar:eye-bold" />,
      onClick: (row: InstructorNotificationItemDto) => handleOpenDetails(row),
    },
  ];

  // Custom renders
  const customRender = {
    image: (row: InstructorNotificationItemDto) =>
      row.imageUrl ? (
        <Avatar
          src={row.imageUrl}
          alt={row.title}
          variant="rounded"
          sx={{ width: 36, height: 36, border: '1px solid #E2E8F0', mx: 'auto' }}
        />
      ) : (
        <Avatar
          variant="rounded"
          sx={{
            width: 36,
            height: 36,
            bgcolor: !row.isRead ? '#EFF6FF' : '#F4F6F8',
            color: !row.isRead ? '#2563EB' : '#919EAB',
            mx: 'auto',
          }}
        >
          <Iconify icon="solar:bell-bing-bold" width={18} />
        </Avatar>
      ),
    title: (row: InstructorNotificationItemDto) => (
      <Box
        onClick={() => handleOpenDetails(row)}
        sx={{ cursor: 'pointer', maxWidth: 220 }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: !row.isRead ? 800 : 600,
            color: '#1C252E',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {row.title}
        </Typography>
      </Box>
    ),
    message: (row: InstructorNotificationItemDto) => (
      <Typography
        variant="body2"
        onClick={() => handleOpenDetails(row)}
        sx={{
          maxWidth: 340,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: !row.isRead ? '#1C252E' : '#64748B',
          fontWeight: !row.isRead ? 600 : 400,
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {row.message}
      </Typography>
    ),
    type: (row: InstructorNotificationItemDto) => getTypeChip(row.type),
    status: (row: InstructorNotificationItemDto) => (
      <Chip
        size="small"
        label={row.isRead ? t('columns.read') : t('columns.unread')}
        sx={{
          bgcolor: row.isRead ? '#F1F5F9' : '#ECFDF5',
          color: row.isRead ? '#64748B' : '#059669',
          fontWeight: 700,
          fontSize: '0.75rem',
          borderRadius: '6px',
        }}
      />
    ),
    createdAt: (row: InstructorNotificationItemDto) => (
      <Typography variant="caption" sx={{ color: '#637381', fontWeight: 500 }}>
        {formatDate(row.createdAt)}
      </Typography>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Top Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>

        <Stack direction="row" spacing={1.5}>
          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              startIcon={<Iconify icon="solar:check-read-linear" />}
              sx={{
                borderRadius: 1.5,
                borderColor: '#E2E8F0',
                color: '#475569',
                fontWeight: 700,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              {t('mark_all_read')}
            </Button>
          )}

          {/* Send notification button with proper gap between icon and text */}
          <Button
            variant="contained"
            onClick={() => setSendDialogOpen(true)}
            startIcon={<Iconify icon="mingcute:add-line" width={20} />}
            sx={{
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              boxShadow: 'none',
              gap: 1.25,
              '& .MuiButton-startIcon': {
                mx: 0,
                ...(isRtl ? { ml: 1 } : { mr: 1 }),
              },
              '&:hover': { bgcolor: '#2C353E' },
            }}
          >
            {t('send_notification_btn')}
          </Button>
        </Stack>
      </Stack>

      {/* Main Card with Full-Width Filters Bar & Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
        }}
      >
        {/* Dedicated Filter Controls Bar (Matching Image 2 + Swagger params, Full-Width Distributed) */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 1.5,
            width: '100%',
          }}
        >
          {/* 1. Search Input: Icon placed at startAdornment (on the other side) */}
          <TextField
            fullWidth
            size="small"
            placeholder={t('filters.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              flex: { xs: '1 1 100%', md: 1.25 },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
              '& .MuiOutlinedInput-root': {
                height: 42,
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                fontSize: 13.5,
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#94A3B8' },
              },
              '& .MuiInputBase-input': {
                py: 0,
                height: 42,
                fontSize: 13.5,
                color: '#1E293B',
                fontWeight: 500,
                '&::placeholder': { color: '#64748B', opacity: 1 },
              },
            }}
          />

          {/* 2. User select (المستخدم) */}
          <FormControl
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              flex: { xs: '1 1 100%', md: 1 },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
            }}
          >
            <Select
              fullWidth
              variant="outlined"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              displayEmpty
              sx={{
                height: 42,
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                fontSize: 13.5,
                color: userIdFilter === 'all' ? '#64748B' : '#1E293B',
                fontWeight: 500,
                '& fieldset, & .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#94A3B8',
                },
                '& .MuiSelect-select': {
                  py: 0,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiSelect-icon': { color: '#64748B' },
              }}
            >
              <MenuItem value="all">{t('filters.all_users')}</MenuItem>
              {students.map((st) => (
                <MenuItem key={st.id || st.studentId} value={st.studentId || st.id}>
                  {st.name || st.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 3. Date select (التاريخ) */}
          <FormControl
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              flex: { xs: '1 1 100%', md: 1 },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
            }}
          >
            <Select
              fullWidth
              variant="outlined"
              value={datePeriodFilter}
              onChange={(e) => setDatePeriodFilter(e.target.value)}
              displayEmpty
              sx={{
                height: 42,
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                fontSize: 13.5,
                color: datePeriodFilter === 'all' ? '#64748B' : '#1E293B',
                fontWeight: 500,
                '& fieldset, & .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#94A3B8',
                },
                '& .MuiSelect-select': {
                  py: 0,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiSelect-icon': { color: '#64748B' },
              }}
            >
              <MenuItem value="all">{t('filters.all_dates')}</MenuItem>
              <MenuItem value="today">{t('filters.today')}</MenuItem>
              <MenuItem value="yesterday">{t('filters.yesterday')}</MenuItem>
              <MenuItem value="this_week">{t('filters.this_week')}</MenuItem>
              <MenuItem value="this_month">{t('filters.this_month')}</MenuItem>
              <MenuItem value="last_month">{t('filters.last_month')}</MenuItem>
              <MenuItem value="last_3_months">{t('filters.last_3_months')}</MenuItem>
            </Select>
          </FormControl>

          {/* 4. Type select (نوع الإشعار) */}
          <FormControl
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              flex: { xs: '1 1 100%', md: 1 },
              width: { xs: '100%', md: 'auto' },
              minWidth: 0,
            }}
          >
            <Select
              fullWidth
              variant="outlined"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              displayEmpty
              sx={{
                height: 42,
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                fontSize: 13.5,
                color: typeFilter === 'all' ? '#64748B' : '#1E293B',
                fontWeight: 500,
                '& fieldset, & .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#94A3B8',
                },
                '& .MuiSelect-select': {
                  py: 0,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiSelect-icon': { color: '#64748B' },
              }}
            >
              <MenuItem value="all">{t('filters.all_types')}</MenuItem>
              <MenuItem value="General">{t('filters.type_general')}</MenuItem>
              <MenuItem value="CoursePromo">{t('filters.type_course_promo')}</MenuItem>
              <MenuItem value="PurchaseComplete">{t('filters.type_purchase_complete')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Content Area */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: '#919EAB' }}>
            <Iconify icon="solar:bell-off-bold" width={48} sx={{ mb: 1, opacity: 0.5 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {t('empty_received')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 0.5 }}>
            <SharedTable<InstructorNotificationItemDto>
              data={items}
              count={totalCount}
              tableHead={tableHead}
              actions={actions}
              customRender={customRender}
            />
          </Box>
        )}
      </Card>

      {/* Details Dialog */}
      <InstructorNotificationDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedNotificationId(null);
        }}
        notificationId={selectedNotificationId}
        isSent={false}
      />

      {/* Send Notification to Course Students Dialog */}
      <SendCourseNotificationDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onSuccess={() => {
          fetchNotifications(true);
        }}
      />
    </Box>
  );
}
