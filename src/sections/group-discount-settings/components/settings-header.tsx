'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function GroupDiscountSettingsHeader() {
  const t = useTranslations('GroupDiscountSettings');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <Button
        variant="contained"
        disabled
        sx={{ minWidth: 170, minHeight: 44, bgcolor: '#17243E', borderRadius: 1.5 }}
      >
        {t('edit_settings')}
      </Button>
    </Box>
  );
}
