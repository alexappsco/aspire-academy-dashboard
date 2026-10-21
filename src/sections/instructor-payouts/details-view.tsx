'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

import { paths } from 'src/routes/paths';
import {
  InstructorDueDetailsResponse,
  InstructorTransferItem,
} from 'src/types/instructor-payout';
import { getInstructorDueDetails, getInstructorTransfers } from 'src/actions/instructor-dues';
import { resolveReceiptUrl } from 'src/types/order';
import InstructorBankInfoCard from './components/InstructorBankInfoCard';
import InstructorBalanceCard from './components/InstructorBalanceCard';
import TransactionsTable from './components/TransactionsTable';
import RegisterTransferDialog from './components/RegisterTransferDialog';

interface Props {
  instructorId: string;
}

export default function InstructorPayoutDetailsView({ instructorId }: Props) {
  const t = useTranslations('InstructorPayouts.details');
  const locale = useLocale();
  const toast = useToast();

  // Instructor details state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<InstructorDueDetailsResponse | null>(null);

  // Transfers log state
  const [transfers, setTransfers] = useState<InstructorTransferItem[]>([]);
  const [totalTransfersCount, setTotalTransfersCount] = useState<number>(0);
  const [transfersPage, setTransfersPage] = useState<number>(0);
  const [transfersRowsPerPage, setTransfersRowsPerPage] = useState<number>(10);
  const [transfersLoading, setTransfersLoading] = useState<boolean>(true);

  // Dialog State
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  // 1. Fetch Instructor Due Details
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInstructorDueDetails(instructorId);
      if (res.success && res.data) {
        setInstructor(res.data);
      } else {
        const errorMsg = res.error || t('failed_to_load');
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('failed_to_load');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [instructorId, t, toast]);

  // 2. Fetch Transfers Log
  const fetchTransfers = useCallback(async () => {
    setTransfersLoading(true);
    try {
      const res = await getInstructorTransfers(instructorId, {
        SkipCount: transfersPage * transfersRowsPerPage,
        MaxResultCount: transfersRowsPerPage,
      });

      if (res.success && res.data) {
        setTransfers(res.data.items || []);
        setTotalTransfersCount(res.data.totalCount || 0);
      }
    } catch {
      // Keep existing list on error
    } finally {
      setTransfersLoading(false);
    }
  }, [instructorId, transfersPage, transfersRowsPerPage]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Handler when transfer is registered in dialog
  const handleTransferSuccess = () => {
    // Re-fetch both summary details and transfers list to stay completely synced with backend
    fetchDetails();
    fetchTransfers();
  };

  // View Receipt: opens the image directly in a new tab without a dialog
  const handleOpenReceipt = (receiptUrl?: string | null) => {
    if (!receiptUrl) {
      toast.info('لا توجد صورة إيصال مرفقة');
      return;
    }
    const url = resolveReceiptUrl(receiptUrl);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info('لا توجد صورة إيصال مرفقة');
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
        <Skeleton variant="rounded" width={220} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={320} height={36} sx={{ mb: 3 }} />
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !instructor) {
    return (
      <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDetails}>
              {t('retry')}
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          {error || t('failed_to_load')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
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
          mb: 1.5,
          '& a': {
            color: '#64748B',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 13,
            '&:hover': { color: '#0F172A' },
          },
        }}
      >
        <Link href={paths.instructorPayouts.root}>{t('breadcrumbs_root')}</Link>
        <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 13 }}>
          {instructor.instructorName}
        </Typography>
      </Breadcrumbs>

      {/* 2. Page Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          color: '#0F172A',
          fontSize: { xs: 22, md: 26 },
          mb: 3,
          textAlign: 'start',
        }}
      >
        {t('page_title', { name: instructor.instructorName })}
      </Typography>

      {/* 3. Top Section: 2 Cards (Bank Identity & Balance Summary) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Right Card in RTL: Bank Details & Action */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <InstructorBankInfoCard
            instructor={instructor}
            onOpenTransferDialog={() => setTransferDialogOpen(true)}
          />
        </Grid>

        {/* Left Card in RTL: Balance Summary & Progress */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <InstructorBalanceCard instructor={instructor} />
        </Grid>
      </Grid>

      {/* 4. Financial Transfers Log Table */}
      <TransactionsTable
        transactions={transfers}
        totalCount={totalTransfersCount}
        page={transfersPage}
        rowsPerPage={transfersRowsPerPage}
        loading={transfersLoading}
        onPageChange={setTransfersPage}
        onRowsPerPageChange={setTransfersRowsPerPage}
        onViewReceipt={handleOpenReceipt}
      />

      {/* 5. Modals */}
      <RegisterTransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        instructor={instructor}
        onSuccess={handleTransferSuccess}
      />
    </Box>
  );
}
