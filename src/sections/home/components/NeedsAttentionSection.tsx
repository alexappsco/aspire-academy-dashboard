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
import { MOCK_NEEDS_ATTENTION } from '../_mock';

export default function NeedsAttentionSection() {
  const t = useTranslations('Home.needs_attention');
  const router = useRouter();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Header */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}
        >
          {t('subtitle')}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}
          >
            {t('title')}
          </Typography>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            !
          </Box>
        </Stack>
      </Stack>

      {/* 3 Action Cards */}
      <Grid container spacing={2}>
        {MOCK_NEEDS_ATTENTION.map((card) => (
          <Grid key={card.id} size={{ xs: 12, md: 4 }}>
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
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                },
              }}
            >
              {/* Header with Circle Count and Title */}
              <Box>
                <Stack
                  direction="row"
                  spacing={1.75}
                  sx={{ alignItems: 'center', mb: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: card.circleBg,
                      color: card.circleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 19,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {card.count}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
                  >
                    {t(card.titleKey)}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    fontSize: 13,
                    lineHeight: 1.6,
                    mb: 2.5,
                    minHeight: 40,
                  }}
                >
                  {t(card.descKey)}
                </Typography>
              </Box>

              {/* Action Button & Status dot */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1.5,
                  borderTop: '1px solid #F8FAFC',
                }}
              >
                <Button
                  size="small"
                  onClick={() => router.push(card.actionHref)}
                  endIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
                  sx={{
                    bgcolor: card.btnBg,
                    color: card.btnColor,
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.75,
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: card.btnHoverBg,
                    },
                  }}
                >
                  {t(card.actionKey)}
                </Button>

                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: card.badgeColor,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: card.badgeColor,
                    }}
                  >
                    {t(card.badgeKey)}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
