'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';
import type { DailyTimeSlot } from '../types';

interface Props {
  date: string;
  slots: DailyTimeSlot[];
  onManageAvailability?: () => void;
  onUpdateWeeklySchedule?: () => void;
}

export default function TodayScheduleCard({
  date,
  slots,
  onManageAvailability,
  onUpdateWeeklySchedule,
}: Props) {
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
      {/* Header */}
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '1.1rem' }}>
            جدول اليوم الزمني
          </Typography>

          <Button
            onClick={onManageAvailability}
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.85rem',
              p: 0,
              minWidth: 'auto',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            إدارة التوافر
          </Button>
        </Stack>

        <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', mt: 0.5, fontWeight: 500 }}>
          {date}
        </Typography>
      </Box>

      {/* Slots List */}
      <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
        {slots.map((slot) => {
          if (slot.isBooked) {
            return (
              <Box
                key={slot.id}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderInlineStart: '4px solid #2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                {/* Time */}
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E3A8A', minWidth: 65 }}>
                  {slot.time}
                </Typography>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#1E3A8A' }}>
                    {slot.title}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25 }}>
                    <Iconify icon="solar:user-bold" width={14} sx={{ color: '#2563EB' }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>
                      {slot.attendee} ({slot.duration})
                    </Typography>
                  </Stack>
                </Box>

                {/* Badge */}
                <Chip
                  label="محجوز"
                  size="small"
                  sx={{
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    height: 22,
                  }}
                />
              </Box>
            );
          }

          return (
            <Box
              key={slot.id}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: '#FAFAFA',
                border: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              {/* Time */}
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748B', minWidth: 65 }}>
                {slot.time}
              </Typography>

              {/* Status text */}
              <Typography sx={{ flex: 1, fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>
                {slot.statusText}
              </Typography>

              {/* Badge */}
              <Chip
                label="متاح"
                size="small"
                sx={{
                  bgcolor: '#F1F5F9',
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  height: 22,
                }}
              />
            </Box>
          );
        })}
      </Stack>

      {/* Action Button */}
      <Button
        variant="outlined"
        fullWidth
        onClick={onUpdateWeeklySchedule}
        sx={{
          color: '#1C252E',
          borderColor: '#E2E8F0',
          borderRadius: '10px',
          py: 1.2,
          fontWeight: 700,
          fontSize: '0.875rem',
          textTransform: 'none',
          '&:hover': {
            borderColor: '#CBD5E1',
            bgcolor: '#F8FAFC',
          },
        }}
      >
        تحديث الجدول الأسبوعي
      </Button>
    </Card>
  );
}
