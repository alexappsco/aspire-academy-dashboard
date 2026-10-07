'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Iconify from 'src/components/iconify';
import { MOCK_PRIVATE_REQUESTS } from './_mock';
import { PrivateRequestItem, PrivateRequestStatus, PrivateRequestServiceType } from 'src/types/private-request';

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
  requestId?: string;
}

export default function PrivateRequestDetailsView({ requestId = 'PR-1050' }: Props) {
  const locale = useLocale();

  // Find initial request from mock or default to PR-1050
  const initialRequest = useMemo(() => {
    return (
      MOCK_PRIVATE_REQUESTS.find((r) => r.id === requestId) ||
      MOCK_PRIVATE_REQUESTS[0]
    );
  }, [requestId]);

  const [request, setRequest] = useState<PrivateRequestItem>(initialRequest);

  // Status handlers for interactive UI preview
  const handleStatusChange = (newStatus: PrivateRequestStatus) => {
    setRequest((prev) => ({
      ...prev,
      status: newStatus,
      acceptedAtFormatted:
        newStatus !== 'new' ? prev.acceptedAtFormatted || '5 أكتوبر 2026 - 11:30 ص' : undefined,
    }));
  };

  const handleServiceTypeChange = (newType: PrivateRequestServiceType) => {
    setRequest((prev) => ({
      ...prev,
      serviceType: newType,
    }));
  };

  const handleInstructorAccept = () => {
    setRequest((prev) => ({
      ...prev,
      status: 'pending_admin',
      acceptedAtFormatted: '5 أكتوبر 2026 - 11:30 ص',
    }));
  };

  const handleInstructorReject = () => {
    setRequest((prev) => ({
      ...prev,
      status: 'cancelled',
    }));
  };

  const handleFinishService = () => {
    setRequest((prev) => ({
      ...prev,
      status: 'completed',
    }));
  };

  const isActive = request.status === 'active';
  const isRecorded = request.serviceType === 'recorded';
  const isLive = request.serviceType === 'live';

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
        sx={{ mb: 2, '& a': { color: '#64748B', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }}
      >
        <Link href="/">لوحة التحكم</Link>
        <Link href="/private-requests">الطلبات الخاصة</Link>
        <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
          تفاصيل الطلب #{request.id}
        </Typography>
      </Breadcrumbs>

      {/* 2. Request Header Card */}
      <RequestHeaderCard
        request={request}
        onStatusChange={handleStatusChange}
        onServiceTypeChange={handleServiceTypeChange}
        onFinishService={handleFinishService}
      />

      {/* 3. Notice Banner if Pending Admin (Image 3) */}
      {request.status === 'pending_admin' && <AdminReviewNoticeCard />}

      {/* 4. Student Academic Info + Requirements Description (Images 2, 3, 4, 5) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Left: Requirements description */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentRequirementsCard description={request.description} />
        </Grid>

        {/* Right: Academic student info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentInfoCard student={request.student} showContactInfo={isActive} />
        </Grid>
      </Grid>

      {/* 5. State 1: Instructor Decision Card (Image 2) */}
      {request.status === 'new' && (
        <InstructorDecisionCard
          onAccept={handleInstructorAccept}
          onReject={handleInstructorReject}
        />
      )}

      {/* 6. Active States: Financial Terms & KPIs (Images 4 & 5) */}
      {isActive && (
        <>
          <FinancialTermsCards
            terms={request.financialTerms}
            consumption={request.consumption}
            showKpis={isRecorded}
            totalVideosCount={request.totalVideosCount}
            totalDeliveredHours={request.totalDeliveredHours}
            earningHours={request.earningHours}
            recordedEarnings={request.recordedEarnings}
          />

          {/* If Recorded Content: Curriculum / Upload Lessons Section (Image 4) */}
          {isRecorded && (
            <RecordedCurriculumSection initialChapters={request.chapters} />
          )}

          {/* If Live Session: Live Broadcast Room Preview (Image 5) */}
          {isLive && (
            <LiveBroadcastRoomSection
              studentName={request.student.name}
              duration={request.liveSessionDuration}
              elapsedMinutes={request.liveSessionElapsedMinutes}
              expectedEarnings={10.5}
              onEndLiveSession={handleFinishService}
            />
          )}

          {/* Financial Transactions Table (Images 4 & 5) */}
          <FinancialTransactionsTable
            requestId={request.id}
            transactions={request.transactions}
          />
        </>
      )}
    </Box>
  );
}
