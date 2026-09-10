'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import type { DashboardAcademicStructure } from 'src/types/dashboard';

const PRIMARY = '#00A980';
const CARD_BORDER = '#E0E0E0';

interface Props {
  academicStructure?: DashboardAcademicStructure;
}

export default function AcademicOverview({ academicStructure }: Props) {
  const t = useTranslations('Reports.academic');
  const router = useRouter();
  const hasData = academicStructure !== undefined;

  const stats = [
    { key: 'countries', value: hasData ? academicStructure.countriesCount : 0, label: t('countries'), sub: t('countries_sub'), icon: 'solar:globe-bold', iconBg: '#E6F7F2', iconColor: PRIMARY },
    { key: 'universities', value: hasData ? academicStructure.universitiesCount : 0, label: t('universities'), sub: t('universities_sub'), icon: 'solar:buildings-bold', iconBg: '#EDE7F6', iconColor: '#7C3AED' },
    { key: 'subjects', value: hasData ? academicStructure.studyMaterialsCount : 0, label: t('subjects'), sub: t('subjects_sub'), icon: 'solar:book-bookmark-bold', iconBg: '#FFF4E6', iconColor: '#FF9F1C' },
    { key: 'colleges', value: hasData ? academicStructure.facultiesCount : 0, label: t('colleges'), sub: t('colleges_sub'), icon: 'solar:square-academic-cap-2-bold', iconBg: '#E3F2FD', iconColor: '#1976D2' },
  ];

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: '#FFFFFF',
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: '#E6F7F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="solar:buildings-2-bold" width={20} sx={{ color: PRIMARY }} />
        </Box>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
              {t('title')}
            </Typography>
            <Box
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: '#E6F7F2',
                border: `1px solid ${PRIMARY}33`,
              }}
            >
              <Typography sx={{ fontSize: 9, fontWeight: 600, color: PRIMARY }}>
                {t('subtitle')}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* 2x2 Stats Grid */}
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        {stats.map((item) => (
          <Grid key={item.key} size={{ xs: 12, sm: 6 }}>
            <Box
              sx={{
                p: 2.25,
                borderRadius: 2,
                bgcolor: '#F8F9FA',
                border: `1px solid ${CARD_BORDER}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: item.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={22} sx={{ color: item.iconColor }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 24, lineHeight: 1.2 }}>
                  {item.value.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', mb: 0.125 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
                  {item.sub}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Footer Action Bar */}
      <Button
        fullWidth
        onClick={() => router.push('/university')}
        startIcon={<Iconify icon="solar:tuning-2-bold" width={18} />}
        sx={{
          bgcolor: '#F8F9FA',
          color: '#334155',
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 2,
          fontWeight: 700,
          fontSize: 13,
          py: 1,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#EDEDEF',
          },
        }}
      >
        {t('manage_btn')}
      </Button>
    </Card>
  );
}
