'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

export default function PackagesHeader() {
  const t = useTranslations('Packages');

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        gap: 2,
        mb: 4,
      }}
    >
      <Stack gap={0.5} sx={{ flex: 1 }}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Stack>

      <Button
        variant="contained"
        sx={{
          minWidth: 118,
          alignSelf: { sm: 'flex-start' },
          flexShrink: 0,
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <AddRoundedIcon fontSize="small" />
          <Box component="span">{t('add')}</Box>
        </Box>
      </Button>
    </Box>
  );
}
