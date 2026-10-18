'use client';

import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import type { HoursChargeRequestDetails } from 'src/types/hours-charge-request';

import { STATUS_STYLES } from '../constants';
import { normalizeRequestStatus } from '../utils';

type Props = {
  request: HoursChargeRequestDetails;
};

export default function HoursChargeRequestSummaryCards({ request }: Props) {
  const t = useTranslations('HoursChargeRequests');
  const locale = useLocale();
  const status = normalizeRequestStatus(request.status);
  const statusStyle = status
    ? STATUS_STYLES[status]
    : { backgroundColor: '#F1F5F9', color: '#64748B' };
  const numberLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const currencyLabel = request.currencySymbol || request.currencyCode || '';

  const cards = [
    {
      label: t('details.summary.status'),
      value: status ? t('statuses.' + status.toLowerCase()) : t('statuses.unknown'),
      helper: t('details.summary.status_helper_' + (status?.toLowerCase() || 'unknown')),
      color: statusStyle.color,
    },
    {
      label: t('details.summary.requested_hours'),
      value: t('details.summary.hours_value', { hours: request.hours }),
      helper: t('details.summary.hours_helper'),
      color: '#008767',
    },
    {
      label: t('details.summary.transfer_total'),
      value: t('details.summary.amount_value', {
        amount: request.totalAmount.toLocaleString(numberLocale),
        currency: currencyLabel,
      }),
      helper: t('details.summary.amount_formula', {
        hours: request.hours,
        price: request.pricePerHour.toLocaleString(numberLocale),
        currency: currencyLabel,
      }),
      color: '#2563EB',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 1.5,
        p: 2,
        bgcolor: '#F8FAFC',
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          variant="outlined"
          sx={{ p: 2, borderRadius: 2.5, boxShadow: 'none', textAlign: 'center' }}
        >
          <Typography sx={{ color: '#64748B', fontSize: 12 }}>{card.label}</Typography>
          <Typography sx={{ mt: 0.75, color: card.color, fontSize: 20, fontWeight: 800 }}>
            {card.value}
          </Typography>
          <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 11.5 }}>
            {card.helper}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}