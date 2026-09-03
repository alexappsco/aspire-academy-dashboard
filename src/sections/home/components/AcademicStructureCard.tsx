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
import { MOCK_ACADEMIC_STRUCTURE } from '../_mock';

export default function AcademicStructureCard() {
  const t = useTranslations('Home.academic_structure');
  const router = useRouter();
  const data = MOCK_ACADEMIC_STRUCTURE;

  return (
    <Card
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 3,
        borderRadius: 3,
        bgcolor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        boxShadow: '0 1px 4px rgba(37, 99, 235, 0.05)',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
        }}
      >
        {/* Right side in RTL (Icon + Title + Hierarchy Flow) */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: '#1D4ED8',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:buildings-3-bold" width={24} />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16, mb: 0.25 }}
            >
              {t('title')}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.75,
                color: '#2563EB',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <span>{t('countries')} ({data.countries})</span>
              <Iconify icon="solar:arrow-left-linear" width={14} sx={{ color: '#93C5FD' }} />
              <span>{t('universities')} ({data.universities})</span>
              <Iconify icon="solar:arrow-left-linear" width={14} sx={{ color: '#93C5FD' }} />
              <span>{t('colleges')} ({data.colleges})</span>
              <Iconify icon="solar:arrow-left-linear" width={14} sx={{ color: '#93C5FD' }} />
              <span>{t('subjects')} ({data.subjects})</span>
              <Iconify icon="solar:arrow-left-linear" width={14} sx={{ color: '#93C5FD' }} />
              <span style={{ color: '#1E40AF', fontWeight: 800 }}>{t('active_courses')} ({data.activeCourses})</span>
            </Stack>
          </Box>
        </Stack>

        {/* Action Button */}
        <Button
          variant="outlined"
          onClick={() => router.push('/university')}
          startIcon={<Iconify icon="solar:tuning-2-bold" width={18} />}
          sx={{
            flexShrink: 0,
            borderRadius: 2,
            borderColor: '#93C5FD',
            color: '#1D4ED8',
            bgcolor: '#FFFFFF',
            fontWeight: 700,
            fontSize: 13.5,
            px: 2.5,
            py: 1,
            '&:hover': {
              borderColor: '#60A5FA',
              bgcolor: '#F8FAFC',
            },
          }}
        >
          {t('manage_btn')}
        </Button>
      </Stack>
    </Card>
  );
}
