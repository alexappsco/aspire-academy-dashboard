'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

import {
  approveHoursChargeRequest,
  rejectHoursChargeRequest,
} from 'src/actions/hours-charge-requests';
import { useToast } from 'src/components/toast';

import HoursChargeRequestDetailsHeader from './components/details-header';
import RejectHoursChargeRequestDialog from './components/reject-request-dialog';
import ReceiptPreview from './components/receipt-preview';
import HoursChargeRequestActions from './components/request-actions';
import HoursChargeRequestSummaryCards from './components/request-summary-cards';
import StudentChargeDetails from './components/student-charge-details';
import useHoursChargeRequestDetails from './hooks/use-hours-charge-request-details';

type Props = {
  requestId: string;
};

export default function HoursChargeRequestDetailsView({ requestId }: Props) {
  const t = useTranslations('HoursChargeRequests.details');
  const actionT = useTranslations('HoursChargeRequestActions');
  const toast = useToast();
  const { request, loading, error, retry, setRequest } = useHoursChargeRequestDetails(requestId);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    const response = await approveHoursChargeRequest(requestId);
    if (response.success && response.data) {
      const updatedRequest = response.data;
      setRequest((current) => (current ? { ...current, ...updatedRequest } : updatedRequest));
      toast.success(actionT('actions.approve_success'));
    } else {
      toast.error(response.error || actionT('actions.approve_error'));
    }
    setApproving(false);
  };

  const handleReject = async (reason: string) => {
    setRejecting(true);
    const response = await rejectHoursChargeRequest(requestId, reason);
    if (response.success && response.data) {
      const updatedRequest = response.data;
      setRequest((current) => (current ? { ...current, ...updatedRequest } : updatedRequest));
      setRejectDialogOpen(false);
      toast.success(actionT('reject_dialog.success'));
    } else {
      toast.error(response.error || actionT('reject_dialog.error'));
    }
    setRejecting(false);
  };

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
      <HoursChargeRequestSummaryCards request={request} />

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

      {request.status === 'Pending' || request.status === 1 ? (
        <HoursChargeRequestActions
          approving={approving}
          onApprove={() => void handleApprove()}
          onReject={() => setRejectDialogOpen(true)}
        />
      ) : null}

      <RejectHoursChargeRequestDialog
        open={rejectDialogOpen}
        loading={rejecting}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleReject}
      />
    </Box>
  );
}
