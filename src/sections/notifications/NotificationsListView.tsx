'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import { useLocale, useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import DeleteDialog from 'src/components/dialog/delete';
import type { AdminNotificationItemDto } from 'src/types/admin-notification';
import { normalizeNotificationType } from 'src/types/admin-notification';

import NotificationDetailsDialog from './NotificationDetailsDialog';

interface Props {
  data: AdminNotificationItemDto[];
  loading?: boolean;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  broadcastFilter: string;
  onBroadcastFilterChange: (val: string) => void;
  onDelete: (id: string) => Promise<boolean | void>;
  onNavigateToSend: () => void;
}

export default function NotificationsListView({
  data,
  loading = false,
  totalCount,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  broadcastFilter,
  onBroadcastFilterChange,
  onDelete,
  onNavigateToSend,
}: Props) {
  const t = useTranslations('Notifications');
  const tTypes = useTranslations('Notifications.types');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  // Selected row state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Details dialog state
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotificationItemDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handle select single row
  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle select all rows on the page
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = data.map((item) => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleOpenDetails = (row: AdminNotificationItemDto) => {
    setSelectedNotification(row);
    setDetailsOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleting(true);
      await onDelete(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedRows((prev) => prev.filter((id) => id !== deletingId));
    } finally {
      setDeleting(false);
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

  // Table Columns Definition
  const tableHead = [
    {
      id: 'checkbox',
      align: 'center' as cellAlignment,
      label: (
        <Checkbox
          checked={data.length > 0 && selectedRows.length === data.length}
          indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
          onChange={handleSelectAll}
          size="small"
          sx={{ p: 0.5 }}
        />
      ),
      width: 48,
    },
    {
      id: 'image',
      label: t('columns.image'),
      align: 'center' as cellAlignment,
      width: 60,
    },
    {
      id: 'title',
      label: isRtl ? t('columns.title_ar') : t('columns.title_en'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'message',
      label: isRtl ? t('columns.message_ar') : t('columns.message_en'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'type',
      label: t('columns.type'),
      align: 'center' as cellAlignment,
      width: 140,
    },
    {
      id: 'createdAt',
      label: t('columns.date'),
      align: 'center' as cellAlignment,
      width: 160,
    },
  ];

  // Table Actions Menu
  const actions = [
    {
      label: t('actions.view'),
      icon: <Iconify icon="solar:eye-bold" />,
      onClick: (row: AdminNotificationItemDto) => handleOpenDetails(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: AdminNotificationItemDto) => handleDeleteClick(row.id),
    },
  ];

  // Custom rendering for columns
  const customRender = {
    checkbox: (row: AdminNotificationItemDto) => (
      <Checkbox
        checked={selectedRows.includes(row.id)}
        onChange={() => handleSelectRow(row.id)}
        size="small"
        sx={{ p: 0.5 }}
      />
    ),
    image: (row: AdminNotificationItemDto) =>
      row.imageUrl ? (
        <Avatar
          src={row.imageUrl}
          alt={row.titleAr}
          variant="rounded"
          sx={{ width: 38, height: 38, border: '1px solid #E2E8F0', mx: 'auto' }}
        />
      ) : (
        <Avatar
          variant="rounded"
          sx={{ width: 38, height: 38, bgcolor: '#F4F6F8', color: '#919EAB', mx: 'auto' }}
        >
          <Iconify icon="solar:bell-bing-bold" width={20} />
        </Avatar>
      ),
    title: (row: AdminNotificationItemDto) => (
      <Box
        onClick={() => handleOpenDetails(row)}
        sx={{ cursor: 'pointer', maxWidth: 220 }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: '#1C252E',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {isRtl ? row.titleAr : row.titleEn}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#919EAB',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {isRtl ? row.titleEn : row.titleAr}
        </Typography>
      </Box>
    ),
    message: (row: AdminNotificationItemDto) => (
      <Typography
        variant="body2"
        onClick={() => handleOpenDetails(row)}
        sx={{
          maxWidth: 320,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: '#475569',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {isRtl ? row.messageAr : row.messageEn}
      </Typography>
    ),
    type: (row: AdminNotificationItemDto) => getTypeChip(row.type),
    createdAt: (row: AdminNotificationItemDto) => (
      <Typography variant="caption" sx={{ color: '#637381', fontWeight: 500 }}>
        {formatDate(row.createdAt)}
      </Typography>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={onNavigateToSend}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            gap: 1,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          <Iconify icon="mingcute:add-line" width={20} />
          {t('send_notification')}
        </Button>
      </Stack>

      {/* Main card containing filter row and table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          p: 2.5,
        }}
      >
        {/* Top Filters Row */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* Search Field */}
          <TextField
            fullWidth
            size="small"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
              maxWidth: { xs: '100%', md: 360 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
              },
            }}
          />

          {/* Filter Selects */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            {/* Filter by Type */}
            <SelectField
              fullWidth
              size="small"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{tTypes('all')}</MenuItem>
              <MenuItem value="General">{tTypes('General')}</MenuItem>
              <MenuItem value="CoursePromo">{tTypes('CoursePromo')}</MenuItem>
              <MenuItem value="PurchaseComplete">{tTypes('PurchaseComplete')}</MenuItem>
            </SelectField>

            {/* Filter by Delivery (Broadcast / Targeted) */}
            <SelectField
              fullWidth
              size="small"
              value={broadcastFilter}
              onChange={(e) => onBroadcastFilterChange(e.target.value)}
              sx={{
                minWidth: 160,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{t('all_broadcast')}</MenuItem>
              <MenuItem value="broadcast">{t('broadcast_only')}</MenuItem>
              <MenuItem value="specific">{t('targeted_only')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        {/* Loading Spinner or Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <Box sx={{ px: 0.5 }}>
            <SharedTable<AdminNotificationItemDto>
              data={data}
              count={totalCount}
              tableHead={tableHead}
              actions={actions}
              customRender={customRender}
            />
          </Box>
        )}
      </Card>

      {/* Details dialog */}
      <NotificationDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        notification={selectedNotification}
      />

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        loading={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
            setDeletingId(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
