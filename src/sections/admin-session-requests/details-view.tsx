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
import SessionReviewPanel from './components/session-review-panel';
import useAdminSessionRequestDetails from './hooks/use-admin-session-request-details';
import { normalizeSessionRequestStatus } from './utils';

type Props = { requestId: string };

export default function AdminSessionRequestDetailsView({ requestId }: Props) {
  const t = useTranslations('AdminSessionRequestDetails');
  const { request, loading, error, retry, setRequest } = useAdminSessionRequestDetails(requestId);

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
        <Alert severity="error" action={<Button onClick={() => void retry()}>{t('retry')}</Button>}>
          {error || t('load_error')}
        </Alert>
      </Box>
    );
  }

  const normalizedStatus = normalizeSessionRequestStatus(request.status);
  const canApprove = normalizedStatus === 'AwaitingAdminReview';

  return (
    <Box sx={{ py: 2, pb: 6, display: 'grid', gap: 1.5 }}>
      <AdminSessionRequestDetailsHeader request={request} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <RequestInformationCard request={request} />
          <RequestDescriptionCard description={request.description} />
          <ParticipantsTable request={request} />
        </Box>

        <SessionReviewPanel
          request={request}
          canReview={canApprove}
          onReviewed={(updatedRequest) =>
            setRequest((current) =>
              current ? { ...current, ...updatedRequest } : updatedRequest
            )
          }
        />
      </Box>
    </Box>
  );
}
