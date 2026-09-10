'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import Iconify from 'src/components/iconify';

const PRIMARY = '#00A980';
const PAGE_BG = '#F8F9FA';
const CARD_BORDER = '#E0E0E0';

export default function MetricCards() {
  const t = useTranslations('Reports.metrics');

  const items = [
    {
      id: 'students',
      icon: 'solar:users-group-rounded-bold',
      iconBg: '#E6F7F2',
      iconColor: PRIMARY,
      title: t('total_students'),
      value: '12,450',
      change: '+8.5%',
      changeLabel: t('vs_previous'),
      isPositive: true,
    },
    {
      id: 'instructors',
      icon: 'solar:user-bold',
      iconBg: '#E6F7F2',
      iconColor: PRIMARY,
      title: t('total_instructors'),
      value: '320',
      change: '+4.2%',
      changeLabel: t('vs_previous'),
      isPositive: true,
    },
    {
      id: 'courses',
      icon: 'solar:square-academic-cap-2-bold',
      iconBg: '#FFF4E6',
      iconColor: '#FF9F1C',
      title: t('total_courses'),
      value: '856',
      change: '+6.8%',
      changeLabel: t('vs_previous'),
      isPositive: true,
    },
    {
      id: 'published',
      icon: 'solar:check-circle-bold',
      iconBg: '#E6F7F2',
      iconColor: PRIMARY,
      title: t('published_courses'),
      value: '742',
      subBadge: t('published_of', { total: '856', percent: '86.7' }),
      subBadgeBg: '#E6F7F2',
      subBadgeColor: PRIMARY,
    },
    {
      id: 'enrollments',
      icon: 'solar:user-plus-bold',
      iconBg: '#EDE7F6',
      iconColor: '#7C3AED',
      title: t('enrollment_requests'),
      value: '2,840',
      change: '+12.4%',
      changeLabel: t('within_year'),
      isPositive: true,
    },
    {
      id: 'revenue',
      icon: 'solar:wallet-bold-duotone',
      iconBg: '#FFF4E6',
      iconColor: '#FF9F1C',
      title: t('accepted_revenue'),
      value: '485,000',
      change: '+9.2%',
      changeLabel: t('within_year'),
      isPositive: true,
    },
  ];

  return (
    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
      {items.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25 }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#6B7280', fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}
              >
                {item.title}
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={18} />
              </Box>
            </Stack>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1A1A1A',
                fontSize: { xs: 20, md: 22 },
                letterSpacing: '-0.02em',
              }}
            >
              {item.value}
            </Typography>

            <Box sx={{ mt: 1.25 }}>
              {item.subBadge ? (
                <Chip
                  label={item.subBadge}
                  size="small"
                  sx={{
                    bgcolor: item.subBadgeBg,
                    color: item.subBadgeColor,
                    fontWeight: 600,
                    fontSize: 10,
                    height: 20,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Stack
                    direction="row"
                    spacing={0.25}
                    sx={{ alignItems: 'center', color: item.isPositive ? PRIMARY : '#E63946' }}
                  >
                    <Iconify
                      icon={item.isPositive ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                      width={14}
                    />
                    <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{item.change}</Typography>
                  </Stack>
                  <Typography sx={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500 }}>
                    {item.changeLabel}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
