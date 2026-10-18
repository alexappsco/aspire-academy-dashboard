'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';

export default function HoursChargeRequestDetailsHeader() {
  const t = useTranslations('HoursChargeRequests.details');
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        bgcolor: '#FFFFFF',
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 22, md: 26 } }}>
          {t('title')}
        </Typography>
        <Typography sx={{ mt: 0.5, color: '#64748B', fontSize: 13 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
        onClick={() => router.push(paths.hoursChargeRequests.root)}
        sx={{
          alignSelf: { xs: 'stretch', sm: 'center' },
          bgcolor: '#EAF1FF',
          color: '#2563EB',
          boxShadow: 'none',
          '&:hover': { bgcolor: '#DCE8FF', boxShadow: 'none' },
        }}
      >
        {t('back')}
      </Button>
    </Box>
  );
}