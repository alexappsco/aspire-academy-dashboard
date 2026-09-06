'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';

export default function AttentionBanner() {
  const t = useTranslations('Home.attention_banner');
  const router = useRouter();

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(270deg, rgba(0, 82, 204, 0.1) 0%, #FFFFFF 50%, #FFFFFF 100%)',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 82, 204, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        {/* Right side in RTL (Icon & Info) */}
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              bgcolor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/icons/review.svg"
              alt="Review"
              sx={{ width: 22, height: 24 }}
            />
          </Box>

          <Box>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', mb: 0.75, flexWrap: 'wrap', gap: 1 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  fontSize: { xs: 16, md: 18 },
                }}
              >
                {t('title')}
              </Typography>

              <Chip
                label={t('badge')}
                size="small"
                sx={{
                  bgcolor: '#FEE2E2',
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: 12,
                  height: 24,
                  borderRadius: 1.5,
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: '#475569',
                fontSize: { xs: 13, md: 14 },
                lineHeight: 1.6,
                maxWidth: 750,
              }}
            >
              {t('description')}
            </Typography>
          </Box>
        </Stack>

        {/* Action button */}
        <Button
          variant="contained"
          onClick={() => router.push('/courses?status=pending')}
          endIcon={
            <Iconify
              icon="solar:arrow-left-linear"
              width={18}
              sx={{ transform: 'scaleX(var(--rtl-flip, 1))', ml: 0.5 }}
            />
          }
          sx={{
            flexShrink: 0,
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 2,
            px: 3,
            py: 1.25,
            fontWeight: 700,
            fontSize: 14,
            gap: 1,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('review_now')}
        </Button>
      </Stack>
    </Card>
  );
}
