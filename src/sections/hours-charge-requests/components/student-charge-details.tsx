'use client';

import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import type { HoursChargeRequestDetails } from 'src/types/hours-charge-request';

import { formatRequestDate } from '../utils';

type Props = {
  request: HoursChargeRequestDetails;
};

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Box>
      <Typography sx={{ color: '#94A3B8', fontSize: 11.5 }}>{label}</Typography>
      <Typography sx={{ mt: 0.5, color: '#1E293B', fontSize: 13.5, fontWeight: 700 }}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

export default function StudentChargeDetails({ request }: Props) {
  const t = useTranslations('HoursChargeRequests.details');
  const locale = useLocale();

  return (
    <Box sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.75 }}>
        {t('student.title')}
      </Typography>

      <Box sx={{ display: 'grid', gap: 2 }}>
        <DetailRow label={t('student.name')} value={request.userName} />
        <DetailRow label={t('student.country')} value={request.countryName} />
        <DetailRow label={t('student.contact')} value={request.userEmail} />
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.75 }}>
        {t('charge.title')}
      </Typography>

      <Box sx={{ display: 'grid', gap: 2 }}>
        <DetailRow
          label={t('charge.request_number')}
          value={request.requestNumber || request.id}
        />
        <DetailRow
          label={t('charge.submitted_at')}
          value={formatRequestDate(request.creationTime, locale)}
        />
      </Box>
    </Box>
  );
}