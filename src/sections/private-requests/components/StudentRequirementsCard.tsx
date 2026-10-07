'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

interface Props {
  description: string;
}

export default function StudentRequirementsCard({ description }: Props) {
  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title + Literal Quote Badge */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Right in RTL (First child): Title and Icon */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:document-text-bold" width={20} sx={{ color: '#0284C7' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
            وصف متطلبات الطالب والمستهدف الأكاديمي
          </Typography>
        </Stack>

        {/* Left in RTL (Second child): Literal quote badge */}
        <Chip
          label="النص الحرفي للطلب"
          size="small"
          sx={{
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            fontWeight: 700,
            fontSize: 11.5,
            borderRadius: 1.5,
          }}
        />
      </Stack>

      {/* Description Quote Box */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          bgcolor: '#F8FAFC',
          border: '1px solid #F1F5F9',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography
          sx={{
            fontSize: 14.5,
            lineHeight: 1.8,
            color: '#1E293B',
            fontWeight: 600,
            textAlign: 'start',
          }}
        >
          &ldquo;{description}&rdquo;
        </Typography>

        <Typography
          sx={{
            fontSize: 14.5,
            lineHeight: 1.8,
            color: '#1E293B',
            fontWeight: 600,
            textAlign: 'start',
            mt: 2,
          }}
        >
          &ldquo;{description}&rdquo;
        </Typography>
      </Box>
    </Card>
  );
}
