'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

import {
  getSessionRequestDetailsAction,
  getSessionRequestTransactionsAction,
  acceptSessionRequestAction,
  rejectSessionRequestAction,
} from 'src/actions/instructor-session-requests';
import {
  SessionRequestInstructorResult,
  SessionRequestTransactionResult,
  SessionRequestStatusEnum,
  RequestChapter,
  PrivateRequestItem,
} from 'src/types/private-request';

import RequestHeaderCard from './components/RequestHeaderCard';
import StudentInfoCard from './components/StudentInfoCard';
import StudentRequirementsCard from './components/StudentRequirementsCard';
import InstructorDecisionCard from './components/InstructorDecisionCard';
import AdminReviewNoticeCard from './components/AdminReviewNoticeCard';
import FinancialTermsCards from './components/FinancialTermsCards';
import RecordedCurriculumSection from './components/RecordedCurriculumSection';
import LiveBroadcastRoomSection from './components/LiveBroadcastRoomSection';
import FinancialTransactionsTable from './components/FinancialTransactionsTable';

interface Props {
  requestId: string;
}

export default function PrivateRequestDetailsView({ requestId }: Props) {
  const locale = useLocale();
  const toast = useToast();
  const t = useTranslations('PrivateRequests');

  const [request, setRequest] = useState<SessionRequestInstructorResult | null>(null);
  const [transactions, setTransactions] = useState<SessionRequestTransactionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch request details and financial transactions from backend API
  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setLoadingTransactions(true);
    setError(null);
    try {
      const [detailsRes, txRes] = await Promise.all([
        getSessionRequestDetailsAction(requestId),
        getSessionRequestTransactionsAction(requestId),
      ]);

      if (detailsRes.success && detailsRes.data) {
        setRequest(detailsRes.data);
      } else {
        setError(detailsRes.error || t('details.not_found'));
      }

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('details.not_found'));
    } finally {
      setLoading(false);
      setLoadingTransactions(false);
    }
  }, [requestId, t]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  // Status checks normalized across numeric enum and string representation
  const normalizedStatus = useMemo(() => {
    if (!request) return 'Pending';
    const s = request.status as any;
    if (s === 1 || s === 'Pending' || s === SessionRequestStatusEnum.Pending) return 'Pending';
    if (s === 2 || s === 'AwaitingAdminReview' || s === SessionRequestStatusEnum.AwaitingAdminReview)
      return 'AwaitingAdminReview';
    if (s === 3 || s === 'Active' || s === SessionRequestStatusEnum.Active) return 'Active';
    if (s === 4 || s === 'Completed' || s === SessionRequestStatusEnum.Completed) return 'Completed';
    if (s === 5 || s === 'Rejected' || s === SessionRequestStatusEnum.Rejected) return 'Rejected';
    if (s === 6 || s === 'Cancelled' || s === SessionRequestStatusEnum.Cancelled) return 'Cancelled';
    return String(s);
  }, [request]);

  const isNew = normalizedStatus === 'Pending';
  const isPendingAdmin = normalizedStatus === 'AwaitingAdminReview';
  const isActive = normalizedStatus === 'Active';
  const isCompleted = normalizedStatus === 'Completed';
  const isRejected = normalizedStatus === 'Rejected';
  const isCancelled = normalizedStatus === 'Cancelled';

  // Service type check: Live vs Recorded
  const isRecorded = useMemo(() => {
    if (!request) return false;
    const t = request.type;
    return t === 'Recorded' || (t as any) === 2 || String(t).toLowerCase() === 'recorded';
  }, [request]);

  const isLive = !isRecorded;

  // Accept action handler
  const handleInstructorAccept = async () => {
    if (!request) return;
    setIsSubmitting(true);
    try {
      const res = await acceptSessionRequestAction(request.id);
      if (res.success) {
        toast.success(t('notifications.accept_success'));
        setRequest((prev) =>
          prev
            ? {
                ...prev,
                status: SessionRequestStatusEnum.AwaitingAdminReview,
                respondedAt: new Date().toISOString(),
              }
            : null
        );
      } else {
        toast.error(res.error || t('notifications.accept_failed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.accept_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject action handler
  const handleInstructorReject = async (reason?: string) => {
    if (!request) return;
    setIsSubmitting(true);
    try {
      const res = await rejectSessionRequestAction(request.id, reason || '');
      if (res.success) {
        toast.info(t('notifications.reject_success'));
        setRequest((prev) =>
          prev
            ? {
                ...prev,
                status: SessionRequestStatusEnum.Rejected,
                rejectionReason: reason || t('details.rejected_default_reason'),
                respondedAt: new Date().toISOString(),
              }
            : null
        );
      } else {
        toast.error(res.error || t('notifications.reject_failed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.reject_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishService = () => {
    setRequest((prev) =>
      prev
        ? {
            ...prev,
            status: SessionRequestStatusEnum.Completed,
          }
        : null
    );
  };

  // Map backend chapters to UI format
  const mappedChapters: RequestChapter[] = useMemo(() => {
    if (!request?.chapters || request.chapters.length === 0) return [];

    return request.chapters.map((ch, idx) => ({
      id: ch.id || `ch-${idx + 1}`,
      number: ch.order || idx + 1,
      title: ch.title || `الفصل ${idx + 1}`,
      isExpanded: idx === 0,
      lessons: (ch.lessons || []).map((les, lIdx) => ({
        id: les.id || `les-${lIdx + 1}`,
        number: les.order || lIdx + 1,
        title: les.title || `الدرس ${lIdx + 1}`,
        statusBadge: 'معتمد',
        attachments: [
          ...(les.videoUrl
            ? [
                {
                  id: `vid-${les.id}`,
                  type: 'video' as const,
                  title: les.title,
                  url: les.videoUrl,
                  duration: les.durationInSeconds
                    ? `${Math.floor(les.durationInSeconds / 60)} دقيقة`
                    : undefined,
                  statusText: 'جاهز للمشاهدة',
                },
              ]
            : []),
          ...(les.test
            ? [
                {
                  id: `quiz-${les.test.id}`,
                  type: 'quiz' as const,
                  title: `اختبار تقييمي (${les.test.questions?.length || 0} أسئلة)`,
                  questionsCount: les.test.questions?.length || 0,
                  passingScore: 70,
                  statusText: 'معتمد',
                },
              ]
            : []),
        ],
      })),
    }));
  }, [request?.chapters]);

  // Adapted request object for header
  const headerAdaptedRequest: PrivateRequestItem | null = useMemo(() => {
    if (!request) return null;

    let uiStatus: any = 'new';
    if (isPendingAdmin) uiStatus = 'pending_admin';
    else if (isActive) uiStatus = 'active';
    else if (isCompleted) uiStatus = 'completed';
    else if (isRejected) uiStatus = 'rejected';
    else if (isCancelled) uiStatus = 'cancelled';

    return {
      id: request.id,
      serviceType: isRecorded ? 'recorded' : 'live',
      status: uiStatus,
      targetAudience: request.isBroadcast ? 'public' : 'direct',
      student: {
        id: request.student?.studentId || request.student?.countryId || '',
        name: request.student?.name || 'طالب',
        country: request.student?.countryName || 'غير محدد',
        university: '',
        college: request.specializationName || '',
        imageUrl: request.student?.imageUrl || undefined,
        email: request.student?.email || undefined,
      },
      description: request.description || '',
      createdAt: request.creationTime,
      submittedAtFormatted: request.creationTime
        ? new Date(request.creationTime).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined,
      acceptedAtFormatted: request.respondedAt
        ? new Date(request.respondedAt).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : undefined,
      chapters: mappedChapters,
    };
  }, [request, isRecorded, isPendingAdmin, isActive, isCompleted, isRejected, isCancelled, mappedChapters]);

  const displayId =
    request?.id && request.id.length > 12 ? `${request.id.slice(0, 8)}...` : request?.id || requestId;

  // 1. Loading Skeleton
  if (loading) {
    return (
      <Box sx={{ py: 2, pb: 8 }}>
        <Skeleton variant="rounded" width={220} height={24} sx={{ mb: 2.5 }} />
        <Skeleton variant="rounded" width="100%" height={140} sx={{ mb: 3, borderRadius: 3 }} />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" width="100%" height={320} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" width="100%" height={320} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 2. Error State
  if (error || !request || !headerAdaptedRequest) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Alert
          severity="error"
          sx={{ mb: 3, maxWidth: 600, mx: 'auto', borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchRequestDetails}>
              {t('details.retry')}
            </Button>
          }
        >
          {error || t('details.not_found')}
        </Alert>

        <Button
          component={Link}
          href="/private-requests"
          variant="outlined"
          startIcon={<Iconify icon={locale === 'ar' ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'} />}
          sx={{ borderRadius: 2 }}
        >
          {t('details.back_to_list')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 8 }}>
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        separator={
          <Iconify
            icon={locale === 'ar' ? 'solar:alt-arrow-left-linear' : 'solar:alt-arrow-right-linear'}
            width={14}
            sx={{ color: '#94A3B8' }}
          />
        }
        sx={{
          mb: 2,
          '& a': {
            color: '#64748B',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 13,
            '&:hover': { color: '#0F172A' },
          },
        }}
      >
        <Link href="/">{t('details.breadcrumbs.dashboard')}</Link>
        <Link href="/private-requests">{t('details.breadcrumbs.requests')}</Link>
        <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
          {t('details.breadcrumbs.request_details', { id: displayId })}
        </Typography>
      </Breadcrumbs>

      {/* 2. Request Header Card */}
      <RequestHeaderCard
        request={headerAdaptedRequest}
        onFinishService={handleFinishService}
      />

      {/* 3. Notice Banner if Pending Admin */}
      {isPendingAdmin && <AdminReviewNoticeCard />}

      {/* 4. Notice Banner if Rejected */}
      {isRejected && (
        <Card
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            bgcolor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            mb: 3,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="solar:close-circle-bold" width={26} />
            </Box>
            <Box sx={{ flex: 1, textAlign: 'start' }}>
              <Typography sx={{ fontWeight: 800, fontSize: 16.5, color: '#991B1B', mb: 0.5 }}>
                {t('details.rejected_banner_title')}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: '#B91C1C', fontWeight: 600 }}>
                {t('details.rejected_reason_label')} {request.rejectionReason || t('details.rejected_default_reason')}
              </Typography>
            </Box>
          </Stack>
        </Card>
      )}

      {/* 5. Student Academic Info + Requirements Description */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Right in RTL (First child): Academic student info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentInfoCard
            student={request.student}
            specializationName={request.specializationName}
            showContactInfo={isActive}
          />
        </Grid>

        {/* Left in RTL (Second child): Requirements description */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentRequirementsCard
            description={request.description || t('details.requirements_card.no_description')}
          />
        </Grid>
      </Grid>

      {/* 6. State 1: Instructor Decision Card (When status is Pending / New) */}
      {isNew && (
        <InstructorDecisionCard
          isSubmitting={isSubmitting}
          onAccept={handleInstructorAccept}
          onReject={handleInstructorReject}
        />
      )}

      {/* 7. Financial Terms Cards (When pricePerHour is approved / available or request is Active) */}
      {(isActive || Boolean(request.pricePerHour && request.pricePerHour > 0)) && (
        <FinancialTermsCards
          platformPercentage={request.platformPercentage}
          totalChapterHours={request.totalChapterHours}
          effectiveHours={request.effectiveHours}
          pricePerHour={request.pricePerHour}
          effectiveHoursValue={request.effectiveHoursValue}
          currencyCode={request.currencyCode}
          currencySymbol={request.currencySymbol}
        />
      )}

      {/* 8. Active Content Sections */}
      {isActive && (
        <>
          {/* If Recorded Content: Curriculum / Upload Lessons Section */}
          {isRecorded && (
            <RecordedCurriculumSection
              requestId={request.id}
              initialChapters={request.chapters || []}
              onChaptersUpdated={(newChapters) => {
                setRequest((prev) =>
                  prev
                    ? {
                        ...prev,
                        chapters: newChapters,
                        totalChapterHours: newChapters.reduce(
                          (acc, c) => acc + (Number(c.hours) || 0),
                          0
                        ),
                      }
                    : null
                );
              }}
            />
          )}

          {/* If Live Session: Live Broadcast Room Preview */}
          {isLive && (
            <LiveBroadcastRoomSection
              studentName={request.student?.name || 'الطالب'}
              duration="01:30:00"
              elapsedMinutes={0}
              expectedEarnings={
                (Number(request.effectiveHoursValue) || 0) *
                ((100 - (Number(request.platformPercentage) || 0)) / 100)
              }
              currency={request.currencySymbol || request.currencyCode || ''}
              onEndLiveSession={handleFinishService}
            />
          )}

          {/* Financial Transactions Table */}
          <FinancialTransactionsTable
            requestId={request.id}
            transactions={transactions}
            currency={request.currencySymbol || request.currencyCode || ''}
            loading={loadingTransactions}
          />
        </>
      )}
    </Box>
  );
}
