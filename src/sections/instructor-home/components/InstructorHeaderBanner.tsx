'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';

interface Props {
  instructorName?: string;
  onManageSlots?: () => void;
}

export default function InstructorHeaderBanner({ instructorName = 'د. أحمد', onManageSlots }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
        p: { xs: 3, md: 4 },
        mb: 3,
        background: 'linear-gradient(90deg, #0A1128 0%, #101E42 50%, #152A5E 100%)',
        boxShadow: '0 8px 32px rgba(10, 17, 40, 0.15)',
        color: '#FFFFFF',
      }}
    >
      {/* Background ambient lighting effect */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        sx={{
          position: 'relative',
          zIndex: 1,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        {/* Right side: Greeting & Subtitle */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.4rem', sm: '1.75rem' },
              color: '#FFFFFF',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            صباح الخير، {instructorName} 👋
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              lineHeight: 1.6,
              maxWidth: 650,
            }}
          >
            إليك نظرة عامة على أنشطتك التعليمية وحجوزات دروس الطلاب وأداء دوراتك.
          </Typography>
        </Box>

        {/* Left side: Action Button */}
        <Button
          variant="outlined"
          onClick={onManageSlots}
          startIcon={<Iconify icon="solar:calendar-bold" width={18} />}
          sx={{
            color: '#FFFFFF',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            px: 2.5,
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
          }}
        >
          إدارة المواعيد المتاحة
        </Button>
      </Stack>
    </Box>
  );
}
