'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

type Props = { isEnabled: boolean };

export default function CurrentRuleBanner({ isEnabled }: Props) {
  const t = useTranslations('GroupDiscountSettings');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        bgcolor: '#EFF7FF',
      }}
    >
      <Box>
        <Typography sx={{ color: '#2563D9', fontSize: 14, fontWeight: 800 }}>
          {t('current_rule.title')}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.25 }}>
          {t('current_rule.description')}
        </Typography>
      </Box>
      <Chip
        label={t(isEnabled ? 'status.enabled' : 'status.disabled')}
        sx={{
          minWidth: 86,
          bgcolor: isEnabled ? '#DDF5E8' : '#FEE2E2',
          color: isEnabled ? '#14804A' : '#B42318',
          fontWeight: 800,
          borderRadius: 1.5,
        }}
      />
    </Box>
  );
}
