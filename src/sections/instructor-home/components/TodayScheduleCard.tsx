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
        borderRadius: '20px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        bgcolor: '#FFFFFF',
        p: { xs: 2.5, sm: 3 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.3 }}>
              جدول اليوم الزمني
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem', mt: 0.5, fontWeight: 500 }}>
              {date}
            </Typography>
          </Box>

          <Button
            onClick={onManageAvailability}
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.9rem',
              p: 0,
              minWidth: 'auto',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            إدارة التوافر
          </Button>
        </Stack>
      </Box>

      {/* Slots List */}
      <Stack spacing={2} sx={{ mb: 3, flex: 1 }}>
        {slots.map((slot) => {
          if (slot.isBooked) {
            return (
              <Box
                key={slot.id}
                sx={{
                  py: 1.75,
                  px: 2,
                  borderRadius: '14px',
                  bgcolor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                {/* Right side: Time + Vertical Blue Bar + Title/Attendee */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1, gap: 1.5 }}>
                  {/* Time */}
                  <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#2563EB', minWidth: 65 }}>
                    {slot.time}
                  </Typography>

                  {/* Vertical bar */}
                  <Box
                    sx={{
                      width: '3.5px',
                      height: 28,
                      bgcolor: '#2563EB',
                      borderRadius: '3px',
                      flexShrink: 0,
                    }}
                  />

                  {/* Info */}
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                      {slot.title}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                      <Iconify icon="solar:user-bold" width={15} sx={{ color: '#2563EB' }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>
                        {slot.attendee} ({slot.duration})
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                {/* Left side: Booked Badge */}
                <Chip
                  label="محجوز"
                  size="small"
                  sx={{
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    height: 26,
                    px: 1,
                  }}
                />
              </Box>
            );
          }

          return (
            <Box
              key={slot.id}
              sx={{
                py: 1.75,
                px: 2,
                borderRadius: '14px',
                bgcolor: '#FFFFFF',
                border: '1.5px dashed #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              {/* Right side: Time + Vertical Gray Bar + Status text */}
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flex: 1, gap: 1.5 }}>
                {/* Time */}
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155', minWidth: 65 }}>
                  {slot.time}
                </Typography>

                {/* Vertical bar */}
                <Box
                  sx={{
                    width: '3px',
                    height: 20,
                    bgcolor: '#CBD5E1',
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                />

                {/* Text */}
                <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                  {slot.statusText}
                </Typography>
              </Stack>

              {/* Left side: Available Badge */}
              <Chip
                label="متاح"
                size="small"
                sx={{
                  bgcolor: '#E2E8F0',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  height: 26,
                  px: 1,
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
          color: '#1E293B',
          borderColor: '#E2E8F0',
          borderRadius: '12px',
          py: 1.4,
          fontWeight: 700,
          fontSize: '0.95rem',
          textTransform: 'none',
          bgcolor: '#FFFFFF',
          boxShadow: 'none',
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
