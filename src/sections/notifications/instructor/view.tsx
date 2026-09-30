'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocale, useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import {
  getInstructorNotificationsAction,
  getInstructorSentNotificationsAction,
  getInstructorUnreadCountAction,
  markInstructorNotificationAsReadAction,
  markAllInstructorNotificationsAsReadAction,
} from 'src/actions/instructor-notifications';
import type { InstructorNotificationItemDto } from 'src/types/instructor-notification';
import { normalizeNotificationType } from 'src/types/admin-notification';

import SendCourseNotificationDialog from './SendCourseNotificationDialog';
import InstructorNotificationDetailsDialog from './InstructorNotificationDetailsDialog';

export default function InstructorNotificationsView() {
  const t = useTranslations('InstructorNotifications');
  const tTypes = useTranslations('Notifications.types');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const toast = useToast();

  const [currentTab, setCurrentTab] = useState<0 | 1>(0); // 0 = Received, 1 = Sent
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Received Notifications
  const [receivedItems, setReceivedItems] = useState<InstructorNotificationItemDto[]>([]);
  const [receivedTotalCount, setReceivedTotalCount] = useState(0);

  // Sent Notifications
  const [sentItems, setSentItems] = useState<InstructorNotificationItemDto[]>([]);
  const [sentTotalCount, setSentTotalCount] = useState(0);

  // Filters for Received
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [readStatusFilter, setReadStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Dialogs state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  // Fetch Received Notifications
  const fetchReceived = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await getInstructorNotificationsAction({
          SkipCount: 0,
          MaxResultCount: 200,
        });

        if (res.success && res.data) {
          setReceivedItems(res.data.items || []);
          setReceivedTotalCount(res.data.totalCount ?? (res.data.items?.length || 0));
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err) {
        console.error('Failed to load received notifications:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [toast]
  );

  // Fetch Sent Notifications
  const fetchSent = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await getInstructorSentNotificationsAction({
          SkipCount: 0,
          MaxResultCount: 200,
        });

        if (res.success && res.data) {
          setSentItems(res.data.items || []);
          setSentTotalCount(res.data.totalCount ?? (res.data.items?.length || 0));
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err) {
        console.error('Failed to load sent notifications:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchUnreadCount();
    if (currentTab === 0) {
      fetchReceived();
    } else {
      fetchSent();
    }
  }, [currentTab, fetchReceived, fetchSent, fetchUnreadCount]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllInstructorNotificationsAsReadAction();
      if (res.success) {
        toast.success(t('mark_all_read_success'));
        setUnreadCount(0);
        setReceivedItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
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

    if (!notification.isRead && currentTab === 0) {
      try {
        await markInstructorNotificationAsReadAction(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setReceivedItems((prev) =>
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

  // Filtered received items (client-side search & read status)
  const filteredReceived = receivedItems.filter((item) => {
    const matchesSearch =
      !debouncedSearch.trim() ||
      item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.message.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus =
      readStatusFilter === 'all' ||
      (readStatusFilter === 'unread' && !item.isRead) ||
      (readStatusFilter === 'read' && item.isRead);

    return matchesSearch && matchesStatus;
  });

  // Filtered sent items (client-side search)
  const filteredSent = sentItems.filter((item) => {
    return (
      !debouncedSearch.trim() ||
      item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.message.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  });

  // Table Heads
  const receivedTableHead = [
    { id: 'image', label: '', align: 'center' as cellAlignment, width: 50 },
    { id: 'title', label: t('columns.title'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'message', label: t('columns.message'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'type', label: t('columns.type'), align: 'center' as cellAlignment, width: 140 },
    { id: 'status', label: t('columns.status'), align: 'center' as cellAlignment, width: 100 },
    { id: 'createdAt', label: t('columns.date'), align: 'center' as cellAlignment, width: 160 },
  ];

  const sentTableHead = [
    { id: 'image', label: '', align: 'center' as cellAlignment, width: 50 },
    { id: 'title', label: t('columns.title'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'message', label: t('columns.message'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'type', label: t('columns.type'), align: 'center' as cellAlignment, width: 140 },
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
            bgcolor: !row.isRead && currentTab === 0 ? '#EFF6FF' : '#F4F6F8',
            color: !row.isRead && currentTab === 0 ? '#2563EB' : '#919EAB',
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
            fontWeight: !row.isRead && currentTab === 0 ? 800 : 600,
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
          color: !row.isRead && currentTab === 0 ? '#1C252E' : '#64748B',
          fontWeight: !row.isRead && currentTab === 0 ? 600 : 400,
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
          {/* Mark all as read button (only on received tab) */}
          {currentTab === 0 && unreadCount > 0 && (
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

          {/* Send notification button */}
          <Button
            variant="contained"
            onClick={() => setSendDialogOpen(true)}
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2C353E' },
            }}
          >
            {t('send_notification_btn')}
          </Button>
        </Stack>
      </Stack>

      {/* Main Card with Tabs */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          p: 2.5,
        }}
      >
        {/* Tabs Bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            borderBottom: '1px solid #F1F5F9',
            mb: 2.5,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                minWidth: 'auto',
                px: 2,
                py: 1.5,
              },
            }}
          >
            <Tab
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <span>{t('tab_received')}</span>
                  {unreadCount > 0 && (
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          height: 18,
                          minWidth: 18,
                          px: 0.5,
                        },
                      }}
                    />
                  )}
                </Stack>
              }
            />
            <Tab label={t('tab_sent')} />
          </Tabs>

          {/* Search & Filter Controls */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', md: 'auto' }, pb: { xs: 1.5, md: 0 } }}
          >
            <TextField
              size="small"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: '#919EAB' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', sm: 240 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />

            {/* Read status filter (only on Received tab) */}
            {currentTab === 0 && (
              <SelectField
                size="small"
                value={readStatusFilter}
                onChange={(e) =>
                  setReadStatusFilter(e.target.value as 'all' | 'unread' | 'read')
                }
                sx={{
                  width: { xs: '100%', sm: 160 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#FFFFFF',
                    '& fieldset': { borderColor: '#E5E7EB' },
                  },
                }}
              >
                <MenuItem value="all">{t('filter_status_all')}</MenuItem>
                <MenuItem value="unread">{t('filter_status_unread')}</MenuItem>
                <MenuItem value="read">{t('filter_status_read')}</MenuItem>
              </SelectField>
            )}
          </Stack>
        </Stack>

        {/* Content Area */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : currentTab === 0 ? (
          /* Received Notifications Tab */
          filteredReceived.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#919EAB' }}>
              <Iconify icon="solar:bell-off-bold" width={48} sx={{ mb: 1, opacity: 0.5 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {t('empty_received')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 0.5 }}>
              <SharedTable<InstructorNotificationItemDto>
                data={filteredReceived}
                count={receivedTotalCount}
                tableHead={receivedTableHead}
                actions={actions}
                customRender={customRender}
              />
            </Box>
          )
        ) : (
          /* Sent Notifications Tab */
          filteredSent.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: '#919EAB' }}>
              <Iconify icon="solar:letter-opened-bold" width={48} sx={{ mb: 1, opacity: 0.5 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {t('empty_sent')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 0.5 }}>
              <SharedTable<InstructorNotificationItemDto>
                data={filteredSent}
                count={sentTotalCount}
                tableHead={sentTableHead}
                actions={actions}
                customRender={customRender}
              />
            </Box>
          )
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
        isSent={currentTab === 1}
      />

      {/* Send Notification to Course Students Dialog */}
      <SendCourseNotificationDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onSuccess={() => {
          if (currentTab === 1) {
            fetchSent(true);
          } else {
            setCurrentTab(1); // switch to sent to see the newly sent notification
          }
        }}
      />
    </Box>
  );
}
