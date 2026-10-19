'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import AdminSessionRequestDetailsHeader from './components/details-header';
import ParticipantsTable from './components/participants-table';
import RequestDescriptionCard from './components/request-description-card';
import RequestInformationCard from './components/request-information-card';
import useAdminSessionRequestDetails from './hooks/use-admin-session-request-details';

type Props = { requestId: string };

export default function AdminSessionRequestDetailsView({ requestId }: Props) {
  const t = useTranslations('AdminSessionRequestDetails');
  const { request, loading, error, retry } = useAdminSessionRequestDetails(requestId);

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
        <Alert severity="error" action={<Button onClick={retry}>{t('retry')}</Button>}>
          {error || t('load_error')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6, display: 'grid', gap: 1.5 }}>
      <AdminSessionRequestDetailsHeader request={request} />
      <RequestInformationCard request={request} />
      <RequestDescriptionCard description={request.description} />
      <ParticipantsTable request={request} />
    </Box>
  );
}
