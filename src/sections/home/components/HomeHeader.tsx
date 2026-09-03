'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';

export default function HomeHeader() {
  const t = useTranslations('Home.header');
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30_days');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (val: string) => {
    setTimeRange(val);
    handleClose();
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7_days':
        return t('time_range.last_7_days');
      case '30_days':
        return t('time_range.last_30_days');
      case '90_days':
        return t('time_range.last_90_days');
      case 'year':
        return t('time_range.this_year');
      default:
        return t('time_range.last_30_days');
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2.5}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        mb: 3,
      }}
    >
      {/* Greeting Title & Subtitle */}
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: { xs: 22, md: 26 },
              letterSpacing: '-0.02em',
            }}
          >
            {t('greeting')}
          </Typography>
          <Typography component="span" sx={{ fontSize: { xs: 22, md: 26 } }}>
            👋
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            mt: 0.5,
            fontSize: { xs: 13, md: 14 },
            fontWeight: 500,
          }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Action Buttons (Time Range, Export, Quick Course) */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Time Range Selector Button */}
        <Button
          onClick={handleOpen}
          variant="outlined"
          startIcon={
            <Iconify
              icon="solar:calendar-date-bold"
              width={18}
              sx={{ color: '#2563EB' }}
            />
          }
          endIcon={
            <Iconify
              icon="solar:alt-arrow-down-linear"
              width={15}
              sx={{ color: '#64748B', ml: 0.5 }}
            />
          }
          sx={{
            height: 40,
            borderRadius: 2,
            borderColor: '#E2E8F0',
            color: '#1E293B',
            bgcolor: '#FFFFFF',
            fontWeight: 600,
            fontSize: 13.5,
            px: 2,
            gap: 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            '&:hover': {
              borderColor: '#CBD5E1',
              bgcolor: '#F8FAFC',
            },
          }}
        >
          {getTimeRangeLabel()}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                mt: 0.75,
                minWidth: 150,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid #E2E8F0',
              },
            },
          }}
        >
          <MenuItem
            onClick={() => handleSelect('7_days')}
            selected={timeRange === '7_days'}
            sx={{ fontSize: 13.5, fontWeight: 600 }}
          >
            {t('time_range.last_7_days')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSelect('30_days')}
            selected={timeRange === '30_days'}
            sx={{ fontSize: 13.5, fontWeight: 600 }}
          >
            {t('time_range.last_30_days')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSelect('90_days')}
            selected={timeRange === '90_days'}
            sx={{ fontSize: 13.5, fontWeight: 600 }}
          >
            {t('time_range.last_90_days')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSelect('year')}
            selected={timeRange === 'year'}
            sx={{ fontSize: 13.5, fontWeight: 600 }}
          >
            {t('time_range.this_year')}
          </MenuItem>
        </Menu>

        {/* Export Report Button */}
        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:download-minimalistic-bold" width={18} />}
          sx={{
            height: 40,
            borderRadius: 2,
            borderColor: '#E2E8F0',
            color: '#2563EB',
            bgcolor: '#FFFFFF',
            fontWeight: 600,
            fontSize: 13.5,
            px: 2,
            gap: 1,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            '&:hover': {
              borderColor: '#CBD5E1',
              bgcolor: '#F8FAFC',
            },
          }}
        >
          {t('export_report')}
        </Button>

        {/* Quick Course Button */}
        <Button
          variant="contained"
          onClick={() => router.push('/courses/create')}
          startIcon={<Iconify icon="mingcute:add-line" width={18} />}
          sx={{
            height: 40,
            borderRadius: 2,
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 13.5,
            px: 2.5,
            gap: 1,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('quick_course')}
        </Button>
      </Stack>
    </Stack>
  );
}
