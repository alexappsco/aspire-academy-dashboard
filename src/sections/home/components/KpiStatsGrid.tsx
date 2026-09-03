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
import { MOCK_KPIS } from '../_mock';

export default function KpiStatsGrid() {
  const t = useTranslations('Home.kpi');

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {MOCK_KPIS.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              ...(item.id === 'under_review' && {
                borderTop: '4px solid #BA1A1A',
              }),
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
              },
            }}
          >
            {/* Header with Title and Icon */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {t(item.titleKey)}
              </Typography>

              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: item.iconBg,
                  color: item.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={item.icon} width={20} />
              </Box>
            </Stack>

            {/* Value & Badge */}
            <Box sx={{ my: 0.5 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: item.valueColor || '#0F172A',
                    fontSize: { xs: 24, md: 28 },
                    letterSpacing: '-0.02em',
                  }}
                >
                  {item.value}
                </Typography>

                {item.badge && (
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: item.badgeColor || '#DC2626',
                    }}
                  >
                    {t(item.badge)}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Footer Subtitle / Change */}
            <Box sx={{ mt: 1 }}>
              {item.subBadge ? (
                <Chip
                  label={t(item.subBadge)}
                  size="small"
                  sx={{
                    bgcolor: item.subBadgeBg || '#991B1B',
                    color: item.subBadgeColor || '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 11,
                    height: 22,
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75 }}>
                  {item.change && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: 'center',
                        color: item.isPositive ? '#10B981' : '#EF4444',
                        fontWeight: 700,
                        fontSize: 12,
                        gap: 0.25,
                      }}
                    >
                      <Typography component="span" sx={{ fontSize: 12, fontWeight: 700 }}>
                        {item.change}
                      </Typography>
                      <Iconify
                        icon={item.isPositive ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
                        width={14}
                      />
                    </Stack>
                  )}

                  {item.subtitleKey && (
                    <Typography
                      variant="caption"
                      sx={{ color: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                    >
                      {t(item.subtitleKey)}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
