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

import { MOCK_UNIVERSITIES, UniversityItem } from './_mock';
import UniversityFormDialog from './new-edit-university-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedUniversity {
  id: string;
  logo: string;
  name: string;
  country: string;
  order: number;
  createdDate: string;
  active: boolean;
}

export default function UniversityView() {
  const t = useTranslations('Universities');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [universities, setUniversities] = useState<UniversityItem[]>(MOCK_UNIVERSITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<UniversityItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingUniversity(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedUniversity) => {
    const university = universities.find((c) => c.id === row.id);
    if (university) {
      setEditingUniversity(university);
      setDialogOpen(true);
    }
  };

  const handleOpenDelete = (row: FormattedUniversity) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setUniversities((prev) => prev.filter((c) => c.id !== deletingId));
      setDeletingId(null);
    }
  };

  const handleSaveUniversity = (data: Partial<UniversityItem>) => {
    if (editingUniversity) {
      setUniversities((prev) =>
        prev.map((c) => (c.id === editingUniversity.id ? { ...c, ...data } : c))
      );
    } else {
      const newUniversity: UniversityItem = {
        id: Date.now().toString(),
        logo: data.logo ?? '/icons/package.svg',
        name_ar: data.name_ar ?? '',
        name_en: data.name_en ?? '',
        country_ar: data.country_ar ?? '',
        country_en: data.country_en ?? '',
        order: data.order ?? 1,
        createdDate_ar: new Date().toLocaleDateString('ar-EG'),
        createdDate_en: new Date().toLocaleDateString('en-US'),
        active: data.active ?? true,
      };
      setUniversities((prev) => [newUniversity, ...prev]);
    }
  };

  const handleToggleStatus = (id: string) => {
    setUniversities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const formattedUniversities: FormattedUniversity[] = universities.map((item) => ({
    id: item.id,
    logo: item.logo,
    name: isRtl ? item.name_ar : item.name_en,
    country: isRtl ? item.country_ar : item.country_en,
    order: item.order,
    createdDate: isRtl ? item.createdDate_ar : item.createdDate_en,
    active: item.active,
  }));

  const filteredUniversities = formattedUniversities.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.active) ||
      (statusFilter === 'inactive' && !item.active);

    return matchesSearch && matchesStatus;
  });

  const tableHead = [
    { id: 'logo', label: t('columns.logo'), align: 'center' as cellAlignment },
    { id: 'name', label: t('columns.name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'country', label: t('columns.country'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'order', label: t('columns.order'), align: 'center' as cellAlignment },
    { id: 'createdDate', label: t('columns.created_date'), align: 'center' as cellAlignment },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedUniversity) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedUniversity) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    logo: (row: FormattedUniversity) => (
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 110,
          height: 75,
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          p: 1.5,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ width: 32, height: 32, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={row.logo}
            alt={row.name}
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/package.svg';
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#1E293B', fontSize: 11 }}>
          {row.name}
        </Typography>
      </Box>
    ),
    order: (row: FormattedUniversity) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.order}
      </Typography>
    ),
    active: (row: FormattedUniversity) => {
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
          <Typography variant="body2" sx={{ color: '#637381' }}>
            {t('subtitle')}
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
          {t('add_university')}
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

          <SelectField
            fullWidth
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            slotProps={{
              select: { displayEmpty: true },
            }}
            sx={{
              maxWidth: 200,
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

        {/* Table list */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedUniversity>
            data={filteredUniversities}
            count={filteredUniversities.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <UniversityFormDialog
        key={editingUniversity?.id ?? 'new'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialData={editingUniversity}
        onSave={handleSaveUniversity}
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
