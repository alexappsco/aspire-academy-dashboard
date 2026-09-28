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
import type { WeeklyAvailabilityDay } from '../types';

interface Props {
  days: WeeklyAvailabilityDay[];
  onManageSlots?: () => void;
}

export default function WeeklyAvailabilityCard({ days, onManageSlots }: Props) {
  const t = useTranslations('InstructorHome.availability');

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        bgcolor: '#FFFFFF',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        {/* Header */}
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '1.05rem' }}>
              {t('title')}
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mt: 0.25 }}>
              {t('subtitle')}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:calendar-date-bold" width={22} />
          </Box>
        </Stack>

        {/* Days List */}
        <Stack spacing={1.5} sx={{ my: 2 }}>
          {days.map((day, idx) => (
            <Stack
              key={idx}
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.25,
                borderRadius: '10px',
                bgcolor: day.isUnavailable ? '#FFF5F5' : '#F8FAFC',
                border: '1px solid',
                borderColor: day.isUnavailable ? '#FED7D7' : '#F1F5F9',
              }}
            >
              {/* Day name */}
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C252E' }}>
                {day.dayName}
              </Typography>

              {/* Time or unavailable badge */}
              {day.isUnavailable ? (
                <Chip
                  label={t('not_available')}
                  size="small"
                  sx={{
                    bgcolor: '#FEE2E2',
                    color: '#DC2626',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    height: 22,
                  }}
                />
              ) : (
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  {day.timeRange}
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Button */}
      <Box sx={{ pt: 2, mt: 1 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onManageSlots}
          startIcon={<Iconify icon="solar:calendar-bold" width={18} />}
          sx={{
            color: '#1C252E',
            borderColor: '#E2E8F0',
            borderRadius: '10px',
            py: 1.2,
            gap: 1,
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#CBD5E1',
              bgcolor: '#F8FAFC',
            },
          }}
        >
          {t('manage_slots')}
        </Button>
      </Box>
    </Card>
  );
}
