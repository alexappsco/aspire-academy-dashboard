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
import { useLocale, useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';

import { NotificationItem } from './_mock';
import NotificationDetailsDialog from './NotificationDetailsDialog';

interface Props {
  data: NotificationItem[];
  onDelete: (id: string) => void;
  onNavigateToSend: () => void;
}

export default function NotificationsListView({ data, onDelete, onNavigateToSend }: Props) {
  const t = useTranslations('Notifications');
  const tUserTypes = useTranslations('Notifications.user_types');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  // Selected row state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Details dialog state
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Client-side filtering logic
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.content_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUserType =
      selectedUserType === 'all' || item.userType === selectedUserType;

    // Date filtering (for mock, assume "31/8/2026" is today, "30/8/2026" is yesterday, etc.)
    const matchesDate =
      selectedDateFilter === 'all' ||
      (selectedDateFilter === 'today' && item.date === '31/8/2026') ||
      (selectedDateFilter === 'this_week' && ['31/8/2026', '30/8/2026', '28/8/2026', '27/8/2026'].includes(item.date));

    return matchesSearch && matchesUserType && matchesDate;
  });

  // Handle select single row
  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle select all rows on the page
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = filteredData.map((item) => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleOpenDetails = (row: NotificationItem) => {
    setSelectedNotification(row);
    setDetailsOpen(true);
  };

  // Table Columns Definition
  const tableHead = [
    {
      id: 'checkbox',
      align: 'center' as cellAlignment,
      label: (
        <Checkbox
          checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
          indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
          onChange={handleSelectAll}
          size="small"
          sx={{ p: 0.5 }}
        />
      ),
      width: 48,
    },
    { id: 'content_ar', label: t('columns.message_ar'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'content_en', label: t('columns.message_en'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'userType', label: t('columns.user_type'), align: 'center' as cellAlignment },
    { id: 'date', label: t('columns.date'), align: 'center' as cellAlignment },
  ];

  // Table Actions Menu
  const actions = [
    {
      label: t('actions.view'),
      icon: <Iconify icon="solar:eye-bold" />,
      onClick: (row: NotificationItem) => handleOpenDetails(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: NotificationItem) => onDelete(row.id),
    },
  ];

  // Custom rendering for columns
  const customRender = {
    checkbox: (row: NotificationItem) => (
      <Checkbox
        checked={selectedRows.includes(row.id)}
        onChange={() => handleSelectRow(row.id)}
        size="small"
        sx={{ p: 0.5 }}
      />
    ),
    content_ar: (row: NotificationItem) => (
      <Typography
        variant="body2"
        onClick={() => handleOpenDetails(row)}
        sx={{
          maxWidth: 280,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {row.content_ar}
      </Typography>
    ),
    content_en: (row: NotificationItem) => (
      <Typography
        variant="body2"
        onClick={() => handleOpenDetails(row)}
        sx={{
          maxWidth: 280,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {row.content_en}
      </Typography>
    ),
    userType: (row: NotificationItem) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {tUserTypes(row.userType)}
      </Typography>
    ),
    date: (row: NotificationItem) => (
      <Typography variant="body2" sx={{ color: '#637381' }}>
        {row.date}
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
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('send_notification')}
        </Button>
      </Stack>

      {/* Main card containing filter row and table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Filters and search row */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2.5, borderBottom: '1px dashed #F1F3F5' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 340 } }}>
            <SelectField
              fullWidth
              size="small"
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{t('dates.all') === 'Date' ? 'User Type' : 'نوع المستخدم'}</MenuItem>
              <MenuItem value="student">{t('user_types.student')}</MenuItem>
              <MenuItem value="lecturer">{t('user_types.lecturer')}</MenuItem>
            </SelectField>

            <SelectField
              fullWidth
              size="small"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#E5E7EB',
                  },
                },
              }}
            >
              <MenuItem value="all">{t('dates.all')}</MenuItem>
              <MenuItem value="today">{t('dates.today')}</MenuItem>
              <MenuItem value="this_week">{t('dates.this_week')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        {/* Table list */}
        <Box sx={{ px: 1 }}>
          <SharedTable<NotificationItem>
            data={filteredData}
            count={filteredData.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Details dialog */}
      <NotificationDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        notification={selectedNotification}
      />
    </Box>
  );
}
