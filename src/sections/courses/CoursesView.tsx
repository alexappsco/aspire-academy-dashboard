'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';

import { MOCK_COURSES } from './_mock';

interface FormattedCourse {
  id: string;
  title: string;
  lecturer: string;
  specialty: string;
  students: number;
  rating: number;
  price: number;
  status: 'active' | 'paused';
  lastUpdate: string;
}

export default function CoursesView() {
  const t = useTranslations('Courses');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Format mock data based on active locale
  const formattedData: FormattedCourse[] = MOCK_COURSES.map((item) => ({
    id: item.id,
    title: isRtl ? item.title_ar : item.title_en,
    lecturer: isRtl ? item.lecturer_ar : item.lecturer_en,
    specialty: isRtl ? item.specialty_ar : item.specialty_en,
    students: item.students,
    rating: item.rating,
    price: item.price,
    status: item.status,
    lastUpdate: isRtl ? item.lastUpdate_ar : item.lastUpdate_en,
  }));

  // Filtering logic
  const filteredData = formattedData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lecturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'cardiology' && (item.specialty === 'أمراض القلب' || item.specialty === 'Cardiology')) ||
      (selectedCategory === 'neurology' && (item.specialty === 'طب الأعصاب' || item.specialty === 'Neurology'));

    const matchesPrice =
      selectedPrice === 'all' ||
      (selectedPrice === 'under_200' && item.price < 200) ||
      (selectedPrice === 'above_200' && item.price >= 200);

    const matchesStatus =
      selectedStatus === 'all' ||
      item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
  });

  // Table columns definition
  const tableHead = [
    { id: 'title', label: t('columns.course_name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'lecturer', label: t('columns.lecturer'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'specialty', label: t('columns.specialty'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'students', label: t('columns.students'), align: 'center' as cellAlignment },
    { id: 'rating', label: t('columns.rating'), align: 'center' as cellAlignment },
    { id: 'price', label: t('columns.price'), align: 'center' as cellAlignment },
    { id: 'status', label: t('columns.status'), align: 'center' as cellAlignment },
    { id: 'lastUpdate', label: t('columns.last_update'), align: (isRtl ? 'right' : 'left') as cellAlignment },
  ];

  // Actions for three-dots menu
  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedCourse) => console.log('Edit course:', row.id),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedCourse) => console.log('Delete course:', row.id),
    },
  ];

  // Custom renders for table cells
  const customRender = {
    rating: (row: FormattedCourse) => (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Iconify icon="eva:star-fill" sx={{ color: '#FFB400', width: 16, height: 16 }} />
        <Typography variant="body2" sx={{ color: '#FFB400', fontWeight: 600 }}>
          {row.rating.toFixed(1)}
        </Typography>
      </Box>
    ),
    status: (row: FormattedCourse) => {
      const isActive = row.status === 'active';
      return (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            bgcolor: isActive ? '#E6F4EA' : '#FCE8E6',
            color: isActive ? '#137333' : '#C5221F',
          }}
        >
          {isActive ? t('status.active') : t('status.paused')}
        </Box>
      );
    },
    students: (row: FormattedCourse) => (
      <Typography variant="body2">
        {row.students.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
      </Typography>
    ),
    price: (row: FormattedCourse) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {row.price}
      </Typography>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
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
          {t('add_course')}
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 500 } }}>
            <SelectField
              fullWidth
              size="small"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              <MenuItem value="all">{t('categories.all')}</MenuItem>
              <MenuItem value="cardiology">{t('categories.cardiology')}</MenuItem>
              <MenuItem value="neurology">{t('categories.neurology')}</MenuItem>
            </SelectField>

            <SelectField
              fullWidth
              size="small"
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
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
              <MenuItem value="all">{t('prices.all')}</MenuItem>
              <MenuItem value="under_200">{t('prices.under_200')}</MenuItem>
              <MenuItem value="above_200">{t('prices.above_200')}</MenuItem>
            </SelectField>

            <SelectField
              fullWidth
              size="small"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
              <MenuItem value="all">{t('statuses.all')}</MenuItem>
              <MenuItem value="active">{t('statuses.active')}</MenuItem>
              <MenuItem value="paused">{t('statuses.paused')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        {/* Table list */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedCourse>
            data={filteredData}
            count={filteredData.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>
    </Box>
  );
}
