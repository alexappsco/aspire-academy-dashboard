'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';

export default function HoursChargeRequestDetailsPlaceholder() {
  const t = useTranslations('HoursChargeRequests.details');
  const router = useRouter();

  return (
    <Box sx={{ py: 3 }}>
      <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{t('title')}</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>{t('description')}</Typography>
        <Button variant="contained" onClick={() => router.push(paths.hoursChargeRequests.root)}>
          {t('back')}
        </Button>
      </Card>
    </Box>
  );
}
