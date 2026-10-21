'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function EditGroupDiscountSettingsHeader() {
  const t = useTranslations('GroupDiscountSettings.edit');

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        {t('title')}
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{t('subtitle')}</Typography>
    </Box>
  );
}
