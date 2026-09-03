'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { useRouter } from 'src/i18n/routing';

export default function HomeHeader() {
  const t = useTranslations('Home.header');
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30_days');

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
        {/* Time Range Selector */}
        <SelectField
          size="small"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          slotProps={{
            select: {
              displayEmpty: true,
              startAdornment: (
                <Iconify
                  icon="solar:calendar-date-bold"
                  width={18}
                  sx={{ color: '#2563EB', mr: 1 }}
                />
              ),
            },
          }}
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              height: 40,
              fontSize: 13.5,
              fontWeight: 600,
              color: '#1E293B',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
            },
          }}
        >
          <MenuItem value="7_days">{t('time_range.last_7_days')}</MenuItem>
          <MenuItem value="30_days">{t('time_range.last_30_days')}</MenuItem>
          <MenuItem value="90_days">{t('time_range.last_90_days')}</MenuItem>
          <MenuItem value="year">{t('time_range.this_year')}</MenuItem>
        </SelectField>

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
