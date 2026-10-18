'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

import HoursChargeRequestDetailsHeader from './components/details-header';
import ReceiptPreview from './components/receipt-preview';
import HoursChargeRequestSummaryCards from './components/request-summary-cards';
import StudentChargeDetails from './components/student-charge-details';
import useHoursChargeRequestDetails from './hooks/use-hours-charge-request-details';

type Props = {
  requestId: string;
};

export default function HoursChargeRequestDetailsView({ requestId }: Props) {
  const t = useTranslations('HoursChargeRequests.details');
  const { request, country, loading, error, retry } = useHoursChargeRequestDetails(requestId);

  if (loading) {
    return (
      <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert
          severity="error"
          action={<Button onClick={retry}>{t('retry')}</Button>}
        >
          {error || t('load_error')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, display: 'grid', gap: 1.5 }}>
      <HoursChargeRequestDetailsHeader />
      <HoursChargeRequestSummaryCards request={request} country={country} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        <Card variant="outlined" sx={{ borderRadius: 2.5, boxShadow: 'none' }}>
          <StudentChargeDetails request={request} />
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2.5, boxShadow: 'none' }}>
          <ReceiptPreview receiptUrl={request.receiptUrl} />
        </Card>
      </Box>
    </Box>
  );
}