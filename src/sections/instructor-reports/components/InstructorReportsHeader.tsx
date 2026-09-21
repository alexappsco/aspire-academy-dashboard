'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function InstructorReportsHeader() {
  const t = useTranslations('InstructorReports');

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 2.5,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1E293B',
            fontSize: { xs: 22, md: 24 },
            mb: 0.25,
          }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: 12,
            fontWeight: 500,
            maxWidth: 520,
            lineHeight: 1.5,
          }}
        >
          {t('subtitle')}
        </Typography>
      </Box>
    </Stack>
  );
}