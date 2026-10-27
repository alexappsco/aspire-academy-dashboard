'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';

import Iconify from 'src/components/iconify';
import { useNotifications } from 'src/contexts/NotificationsContext';
import type { UserNotification } from 'src/types/firebase-notification';

type NotificationsTab = 'all' | 'unread';

function getNotificationIcon(type: string) {
  if (type === 'CoursePromo') return 'solar:tag-price-outline';
  if (type === 'PurchaseComplete') return 'solar:check-circle-outline';
  return 'solar:bell-outline';
}

function parseUtcDate(value: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function NotificationRow({ item, locale }: { item: UserNotification; locale: string }) {
  const date = useMemo(() => {
    const value = parseUtcDate(item.createdAt);
    if (Number.isNaN(value.getTime())) return '';
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(value);
  }, [item.createdAt, locale]);

  return (
    <Box sx={{ position: 'relative', px: 2, py: 1.75, bgcolor: item.isRead ? 'transparent' : '#F7FBFF' }}>
      {!item.isRead && (
        <Box
          sx={{ position: 'absolute', insetInlineStart: 7, top: 22, width: 7, height: 7, borderRadius: '50%', bgcolor: '#1976D2' }}
        />
      )}
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
        <Box
          sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: '#EEF4FF', color: '#1D4ED8', display: 'grid', placeItems: 'center', flexShrink: 0 }}
        >
          <Iconify icon={getNotificationIcon(item.type)} width={21} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: item.isRead ? 600 : 800, color: '#1E293B' }}>
            {item.title}
          </Typography>
          <Typography sx={{ mt: 0.4, fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>
            {item.message}
          </Typography>
          {date && <Typography sx={{ mt: 0.75, fontSize: 11.5, color: '#94A3B8' }}>{date}</Typography>}
        </Box>
      </Stack>
    </Box>
  );
}

export default function NotificationsPopover() {
  const t = useTranslations('NotificationInbox');
  const locale = useLocale();
  const { notifications, totalCount, unreadCount, loading } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tab, setTab] = useState<NotificationsTab>('all');
  const visibleNotifications = tab === 'unread'
    ? notifications.filter((item) => !item.isRead)
    : notifications;

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} aria-label={t('title')} sx={{ color: '#334155' }}>
        <Badge badgeContent={unreadCount} max={99} color="error">
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: locale === 'ar' ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: locale === 'ar' ? 'left' : 'right' }}
        slotProps={{ paper: { sx: { mt: 1, width: { xs: 'calc(100vw - 24px)', sm: 420 }, maxHeight: 560, borderRadius: 2.5, boxShadow: '0 16px 45px rgba(15, 23, 42, 0.16)', overflow: 'hidden' } } }}
      >
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#17243E' }}>{t('title')}</Typography>
        </Box>
        <Tabs
          value={tab}
          onChange={(_, value: NotificationsTab) => setTab(value)}
          variant="fullWidth"
          sx={{ mt: 1, minHeight: 42, '& .MuiTab-root': { minHeight: 42, fontWeight: 700 } }}
        >
          <Tab value="all" label={`${t('all')} (${totalCount})`} />
          <Tab value="unread" label={`${t('unread')} (${unreadCount})`} />
        </Tabs>
        <Divider />

        <Box sx={{ maxHeight: 430, overflowY: 'auto' }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ py: 7, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box>
          ) : visibleNotifications.length === 0 ? (
            <Stack sx={{ py: 7, px: 2, alignItems: 'center' }}>
              <Iconify icon="solar:bell-off-outline" width={42} color="#94A3B8" />
              <Typography sx={{ mt: 1.5, color: '#64748B', textAlign: 'center' }}>
                {tab === 'unread' ? t('empty_unread') : t('empty')}
              </Typography>
            </Stack>
          ) : (
            <Stack divider={<Divider flexItem />}>
              {visibleNotifications.map((item) => <NotificationRow key={item.id} item={item} locale={locale} />)}
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
}
