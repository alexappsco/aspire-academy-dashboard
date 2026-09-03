'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import { MOCK_COURSES_BREAKDOWN } from '../_mock';

export default function CoursesBreakdownCard() {
  const t = useTranslations('Home.courses_breakdown');
  const router = useRouter();
  const items = MOCK_COURSES_BREAKDOWN;

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
        >
          {/* Right in RTL: Icon & Title */}
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:pie-chart-2-bold" width={18} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
            >
              {t('title')}
            </Typography>
          </Stack>

          {/* Left in RTL: View All */}
          <Button
            size="small"
            onClick={() => router.push('/courses')}
            sx={{ color: '#2563EB', fontWeight: 700, fontSize: 13, p: 0, minWidth: 'auto' }}
          >
            {t('view_all')}
          </Button>
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: '#64748B', fontSize: 12, fontWeight: 500, display: 'block' }}
        >
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Multi-Segment Color Bar */}
      <Box
        sx={{
          height: 10,
          borderRadius: 2,
          display: 'flex',
          overflow: 'hidden',
          my: 1.5,
          bgcolor: '#F1F5F9',
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              width: `${item.percentage}%`,
              bgcolor: item.color,
              height: '100%',
            }}
          />
        ))}
      </Box>

      {/* Itemized Breakdown List */}
      <Stack spacing={1.5} sx={{ my: 1 }}>
        {items.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            spacing={1.5}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Right in RTL: Dot & Label */}
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: item.color,
                }}
              />
              <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                {t(item.labelKey)}
              </Typography>
            </Stack>

            {/* Left in RTL: Count & Percentage */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 14, color: '#0F172A', fontWeight: 800, minWidth: 30 }}>
                {item.count}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, minWidth: 40 }}>
                {item.percentage}%
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      {/* Bottom Button */}
      <Button
        fullWidth
        onClick={() => router.push('/courses')}
        endIcon={<Iconify icon="solar:arrow-left-linear" width={16} sx={{ ml: 0.5 }} />}
        sx={{
          mt: 2,
          bgcolor: '#F8FAFC',
          color: '#2563EB',
          borderRadius: 2,
          py: 1,
          gap: 1,
          fontWeight: 700,
          fontSize: 13.5,
          border: '1px solid #E2E8F0',
          '&:hover': {
            bgcolor: '#EFF6FF',
            borderColor: '#BFDBFE',
          },
        }}
      >
        {t('view_all_courses_btn')}
      </Button>
    </Card>
  );
}
