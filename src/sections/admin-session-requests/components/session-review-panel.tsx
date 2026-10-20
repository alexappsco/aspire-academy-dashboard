'use client';

import Box from '@mui/material/Box';

import type { AdminSessionRequest } from 'src/types/admin-session-request';

import useSessionRequestReview from '../hooks/use-session-request-review';
import PlatformPercentageCard from './platform-percentage-card';
import RequestDecisionCard from './request-decision-card';
import ReviewConfirmDialog from './review-confirm-dialog';

type Props = {
  request: AdminSessionRequest;
  canReview: boolean;
  onReviewed: (request: AdminSessionRequest) => void;
};

export default function SessionReviewPanel({ request, canReview, onReviewed }: Props) {
  const review = useSessionRequestReview({ request, canReview, onReviewed });
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <PlatformPercentageCard
        percentage={review.percentage}
        touched={review.touched}
        isValid={review.isValid}
        discountSetting={review.discountSetting}
        discountLoading={review.discountLoading}
        showGroupDiscount={review.isGroup}
        disabled={!canReview}
        onPercentageChange={review.setPercentage}
        onBlur={() => review.setTouched(true)}
      />
      <RequestDecisionCard
        canSubmit={canReview}
        percentageValid={review.isValid}
        onApprove={review.openConfirmation}
      />
      <ReviewConfirmDialog
        open={review.confirmOpen}
        loading={review.submitting}
        requestNumber={request.requestNumber}
        instructorName={request.assignedInstructorName}
        instructorPercentage={Number(review.percentage)}
        onClose={() => review.setConfirmOpen(false)}
        onConfirm={review.confirmReview}
      />
    </Box>
  );
}
