'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  getSessionGroupDiscountSetting,
  reviewAdminSessionRequest,
} from 'src/actions/admin-session-requests';
import { useToast } from 'src/components/toast';
import type {
  AdminSessionRequest,
  SessionGroupDiscountSetting,
} from 'src/types/admin-session-request';

import { isGroupSessionRequest, normalizeSessionRequestStatus } from '../utils';

type Props = {
  request: AdminSessionRequest;
  canReview: boolean;
  onReviewed: (request: AdminSessionRequest) => void;
};

export default function useSessionRequestReview({ request, canReview, onReviewed }: Props) {
  const t = useTranslations('AdminSessionRequestDetails.review');
  const toast = useToast();
  const status = normalizeSessionRequestStatus(request.status);
  const hasSavedPercentage =
    request.platformPercentage !== null &&
    request.platformPercentage !== undefined &&
    (Boolean(request.adminReviewedAt) || status === 'Active' || status === 'Completed');
  const currentInstructorPercentage = hasSavedPercentage
    ? 100 - Number(request.platformPercentage)
    : null;
  const [percentage, setPercentage] = useState(
    currentInstructorPercentage === null ? '' : String(currentInstructorPercentage)
  );
  const [touched, setTouched] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discountSetting, setDiscountSetting] = useState<SessionGroupDiscountSetting | null>(null);
  const [discountLoading, setDiscountLoading] = useState(true);
  const isGroup = isGroupSessionRequest(request);

  const numericPercentage = Number(percentage);
  const isValid =
    percentage.trim() !== '' &&
    Number.isFinite(numericPercentage) &&
    numericPercentage >= 0 &&
    numericPercentage <= 100;

  useEffect(() => {
    const loadSetting = async () => {
      if (!isGroup) {
        setDiscountLoading(false);
        return;
      }
      setDiscountLoading(true);
      const response = await getSessionGroupDiscountSetting();
      setDiscountSetting(response.success && response.data ? response.data : null);
      setDiscountLoading(false);
    };

    void loadSetting();
  }, [isGroup]);

  const openConfirmation = () => {
    if (!canReview) return;
    setTouched(true);
    if (isValid) setConfirmOpen(true);
  };

  const confirmReview = async () => {
    if (!canReview || !isValid) return;
    setSubmitting(true);
    const response = await reviewAdminSessionRequest(request.id, 100 - numericPercentage);

    if (response.success && response.data) {
      onReviewed(response.data);
      setConfirmOpen(false);
      toast.success(t('success'));
    } else {
      toast.error(response.error || t('error'));
    }
    setSubmitting(false);
  };

  return {
    percentage,
    setPercentage,
    touched,
    setTouched,
    isValid,
    confirmOpen,
    setConfirmOpen,
    submitting,
    discountSetting,
    discountLoading,
    isGroup,
    currentInstructorPercentage,
    openConfirmation,
    confirmReview,
  };
}
