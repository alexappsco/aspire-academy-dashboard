'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';

import { MOCK_BANNERS, BannerItem } from './_mock';
import BannerFormDialog from './new-edit-banner-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedBanner {
  id: string;
  title: string;
  image: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export default function BannersView() {
  const t = useTranslations('Banners');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [banners, setBanners] = useState<BannerItem[]>(MOCK_BANNERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedBanner) => {
    const banner = banners.find((b) => b.id === row.id);
    if (banner) {
      setEditingBanner(banner);
      setDialogOpen(true);
    }
  };

  const handleOpenDelete = (row: FormattedBanner) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setBanners((prev) => prev.filter((b) => b.id !== deletingId));
      setDeletingId(null);
    }
  };

  const handleSaveBanner = (data: Partial<BannerItem>) => {
    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) => (b.id === editingBanner.id ? { ...b, ...data } : b))
      );
    } else {
      const newBanner: BannerItem = {
        id: Date.now().toString(),
        title_ar: data.title_ar ?? '',
        title_en: data.title_en ?? '',
        image: data.image ?? '/icons/package.svg',
        startDate: data.startDate ?? '',
        endDate: data.endDate ?? '',
        createdDate_ar: new Date().toLocaleDateString('ar-EG'),
        createdDate_en: new Date().toLocaleDateString('en-US'),
        active: data.active ?? true,
      };
      setBanners((prev) => [newBanner, ...prev]);
    }
  };

  const handleToggleStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id ? { ...banner, active: !banner.active } : banner
      )
    );
  };

  const formattedBanners: FormattedBanner[] = banners.map((item) => ({
    id: item.id,
    title: isRtl ? item.title_ar : item.title_en,
    image: item.image,
    startDate: item.startDate,
    endDate: item.endDate,
    active: item.active,
  }));

  const filteredBanners = formattedBanners.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.active) ||
      (statusFilter === 'inactive' && !item.active);

    const matchesStartDate = !startDate || item.startDate >= startDate;
    const matchesEndDate = !endDate || item.endDate <= endDate;

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const tableHead = [
    { id: 'image', label: t('columns.image'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'startDate', label: t('columns.start_date'), align: 'center' as cellAlignment },
    { id: 'endDate', label: t('columns.end_date'), align: 'center' as cellAlignment },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedBanner) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedBanner) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    image: (row: FormattedBanner) => (
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 110,
          height: 90,
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          p: 1,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ width: 32, height: 32, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={row.image}
            alt={row.title}
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/package.svg';
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          {row.title}
        </Typography>
      </Box>
    ),
    startDate: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.startDate}
      </Typography>
    ),
    endDate: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.endDate}
      </Typography>
    ),
    active: (row: FormattedBanner) => {
      const isActive = row.active;
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(row.id)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: isActive ? '#1E293B' : '#94A3B8' }}>
            {isActive ? t('status.active') : t('status.inactive')}
          </Typography>
        </Box>
      );
    },
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('title')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          onClick={handleOpenAdd}
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
          {t('add_banner')}
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
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 500 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('start_date')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Iconify icon="eva:calendar-outline" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />

            <TextField
              fullWidth
              size="small"
              placeholder={t('end_date')}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Iconify icon="eva:calendar-outline" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />

            <SelectField
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                select: { displayEmpty: true },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            >
              <MenuItem value="all">{t('statuses.all')}</MenuItem>
              <MenuItem value="active">{t('status.active')}</MenuItem>
              <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        {/* Table list */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedBanner>
            data={filteredBanners}
            count={filteredBanners.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <BannerFormDialog
        key={editingBanner?.id ?? 'new'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialData={editingBanner}
        onSave={handleSaveBanner}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
