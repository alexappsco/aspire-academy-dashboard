'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import StarIcon from '@mui/icons-material/Star';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';

import { MOCK_MINUTES, MinutesItem, MinutesStatus } from './_mock';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedMinutes {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  email: string;
  avatar: string;
  joinedDate: string;
  specialty: string;
  subject: string;
  coursesCount: number;
  studentsCount: string;
  rating: number;
  active: boolean;
}

const STATUS_MAP: Record<MinutesStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'مسودة', color: '#637381', bgColor: '#EDF2F7' },
  published: { label: 'مفعل', color: '#118D57', bgColor: '#D2F9E5' },
  archived: { label: 'معطل', color: '#637381', bgColor: '#F4F6F8' },
};

export default function MinutesManagementView() {
  const t = useTranslations('MinutesManagement');
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [minutes, setMinutes] = useState<MinutesItem[]>(MOCK_MINUTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenDelete = (row: FormattedMinutes) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setMinutes((prev) => prev.filter((m) => m.id !== deletingId));
      setDeletingId(null);
    }
  };

  const handleOpenEdit = (row: FormattedMinutes) => {
    router.push(`/${locale}/minutes-management/${row.id}`);
  };

  const handleToggleStatus = (id: string) => {
    setMinutes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const filteredMinutes: FormattedMinutes[] = minutes
    .filter((item) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.active) ||
        (statusFilter === 'inactive' && !item.active);

      if (!matchesStatus) return false;

      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        item.name_en.toLowerCase().includes(query) ||
        item.name_ar.toLowerCase().includes(query) ||
        item.specialty.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query)
      );
    })
    .map((item) => ({
      id: item.id,
      name: isRtl ? item.name_ar : item.name_en,
      name_ar: item.name_ar,
      name_en: item.name_en,
      email: item.email,
      avatar: item.avatar,
      joinedDate: item.joinedDate,
      specialty: item.specialty,
      subject: item.subject,
      coursesCount: item.coursesCount,
      studentsCount: item.studentsCount,
      rating: item.rating,
      active: item.active,
    }));

  const tableHead = [
    { id: 'name', label: t('columns.name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'joinedDate', label: t('columns.joined_date'), align: 'center' as cellAlignment },
    { id: 'specialty', label: t('columns.specialty'), align: 'center' as cellAlignment },
    { id: 'subject', label: t('columns.subject'), align: 'center' as cellAlignment },
    { id: 'coursesCount', label: t('columns.courses'), align: 'center' as cellAlignment },
    { id: 'studentsCount', label: t('columns.students'), align: 'center' as cellAlignment },
    { id: 'rating', label: t('columns.rating'), align: 'center' as cellAlignment },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedMinutes) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedMinutes) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    name: (row: FormattedMinutes) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={row.avatar}
          alt={row.name_en}
          sx={{ width: 40, height: 40, bgcolor: '#E2F0D9' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1C252E' }}>
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#919EAB', fontSize: '12px' }}>
            {row.email}
          </Typography>
        </Box>
      </Box>
    ),
    joinedDate: (row: FormattedMinutes) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.joinedDate}
      </Typography>
    ),
    specialty: (row: FormattedMinutes) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.specialty}
      </Typography>
    ),
    subject: (row: FormattedMinutes) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.subject}
      </Typography>
    ),
    coursesCount: (row: FormattedMinutes) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.coursesCount}
      </Typography>
    ),
    studentsCount: (row: FormattedMinutes) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.studentsCount}
      </Typography>
    ),
    rating: (row: FormattedMinutes) => (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <StarIcon sx={{ color: '#FFAB00', fontSize: '18px' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {row.rating}
        </Typography>
      </Box>
    ),
    active: (row: FormattedMinutes) => {
      const isActive = row.active;
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(row.id)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
            }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: isActive ? '#1C252E' : '#919EAB', fontSize: '13px' }}
          >
            {isActive ? t('status.active') : t('status.inactive')}
          </Typography>
        </Box>
      );
    },
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#F4F6F8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '24px' }}>
          {t('title')}
        </Typography>
        <Button
          variant="contained"
          href={`/${locale}/minutes-management/new`}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: '10px',
            px: 2.5,
            py: 1.2,
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0F172A' },
          }}
        >
          {t('add_minutes')}
        </Button>
      </Box>

      {/* Main Content Card */}
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Status Filter Tabs */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => setStatusFilter('all')}
              sx={{
                fontWeight: 700,
                color: statusFilter === 'all' ? '#1C252E' : '#637381',
                textTransform: 'none',
                borderBottom: statusFilter === 'all' ? '3px solid #1C252E' : '3px solid transparent',
                borderRadius: 0,
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('statuses.all')}</span>
                <Chip
                  label={filteredMinutes.length}
                  size="small"
                  sx={{
                    bgcolor: statusFilter === 'all' ? '#1C252E' : '#EDF2F7',
                    color: statusFilter === 'all' ? '#FFF' : '#637381',
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Button>
            <Button
              onClick={() => setStatusFilter('active')}
              sx={{
                fontWeight: 700,
                color: statusFilter === 'active' ? '#1C252E' : '#637381',
                textTransform: 'none',
                borderBottom: statusFilter === 'active' ? '3px solid #1C252E' : '3px solid transparent',
                borderRadius: 0,
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('status.active')}</span>
                <Chip
                  label={minutes.filter((m) => m.active).length}
                  size="small"
                  sx={{
                    bgcolor: '#D2F9E5',
                    color: '#118D57',
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Button>
            <Button
              onClick={() => setStatusFilter('inactive')}
              sx={{
                fontWeight: 700,
                color: statusFilter === 'inactive' ? '#1C252E' : '#637381',
                textTransform: 'none',
                borderBottom: statusFilter === 'inactive' ? '3px solid #1C252E' : '3px solid transparent',
                borderRadius: 0,
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('status.inactive')}</span>
                <Chip
                  label={minutes.filter((m) => !m.active).length}
                  size="small"
                  sx={{
                    bgcolor: '#EDF2F7',
                    color: '#637381',
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Button>
          </Box>
        </Box>

        {/* Filter Controls */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                height: '44px',
                fontSize: '14px',
                '& fieldset': { borderColor: '#E5E8EB' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Select
            displayEmpty
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as string)}
            renderValue={(selectedVal) =>
              selectedVal === 'all' ? (
                <span style={{ color: '#919EAB' }}>{t('statuses.all')}</span>
              ) : (
                selectedVal === 'active'
                  ? t('status.active')
                  : t('status.inactive')
              )
            }
            sx={{
              width: '180px',
              height: '44px',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#637381',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E8EB' },
            }}
          >
            <MenuItem value="all">{t('statuses.all')}</MenuItem>
            <MenuItem value="active">{t('status.active')}</MenuItem>
            <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
          </Select>
        </Box>

        {/* Table */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedMinutes>
            data={filteredMinutes}
            count={filteredMinutes.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
    
  );
}
