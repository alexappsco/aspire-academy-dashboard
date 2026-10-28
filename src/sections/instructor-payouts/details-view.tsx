'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import { InstructorEarningItem } from 'src/types/instructor-wallet';
import {
  getInstructorDueDetails,
  getInstructorTransfers,
  getInstructorEarnings,
} from 'src/actions/instructor-dues';
import { resolveReceiptUrl } from 'src/types/order';
import InstructorBankInfoCard from './components/InstructorBankInfoCard';
import InstructorBalanceCard from './components/InstructorBalanceCard';
import TransactionsTable from './components/TransactionsTable';
import RegisterTransferDialog from './components/RegisterTransferDialog';
import InstructorMyEarningsTable from '../instructor-wallet/components/InstructorMyEarningsTable';

type LogTab = 'transfers' | 'earnings';

interface Props {
  instructorId: string;
}

export default function InstructorPayoutDetailsView({ instructorId }: Props) {
  const t = useTranslations('InstructorPayouts.details');
  const locale = useLocale();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<LogTab>('transfers');

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

  // Earnings log state
  const [earnings, setEarnings] = useState<InstructorEarningItem[]>([]);
  const [totalEarningsCount, setTotalEarningsCount] = useState<number>(0);
  const [earningsPage, setEarningsPage] = useState<number>(0);
  const [earningsRowsPerPage, setEarningsRowsPerPage] = useState<number>(10);
  const [earningsLoading, setEarningsLoading] = useState<boolean>(true);

  // Dialog State
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

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

  const fetchEarnings = useCallback(async () => {
    setEarningsLoading(true);
    try {
      const res = await getInstructorEarnings(instructorId, {
        SkipCount: earningsPage * earningsRowsPerPage,
        MaxResultCount: earningsRowsPerPage,
      });

      if (res.success && res.data) {
        setEarnings(res.data.items?.items || []);
        setTotalEarningsCount(res.data.items?.totalCount || 0);
      }
    } catch {
      // Keep existing list on error
    } finally {
      setEarningsLoading(false);
    }
  }, [instructorId, earningsPage, earningsRowsPerPage]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (activeTab === 'transfers') {
      fetchTransfers();
    }
  }, [activeTab, fetchTransfers]);

  useEffect(() => {
    if (activeTab === 'earnings') {
      fetchEarnings();
    }
  }, [activeTab, fetchEarnings]);

  // Prefetch inactive tab count for badge
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getInstructorEarnings(instructorId, {
          SkipCount: 0,
          MaxResultCount: 1,
        });
        if (!cancelled && res.success && res.data) {
          setTotalEarningsCount(res.data.items?.totalCount || 0);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [instructorId]);

  const handleTabChange = (_: React.SyntheticEvent, value: LogTab) => {
    setActiveTab(value);
  };

  const handleTransferSuccess = () => {
    fetchDetails();
    fetchTransfers();
  };

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

      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <InstructorBankInfoCard
            instructor={instructor}
            onOpenTransferDialog={() => setTransferDialogOpen(true)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <InstructorBalanceCard instructor={instructor} />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, borderBottom: '1px solid #F1F5F9' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 52,
              '& .MuiTabs-indicator': {
                height: 2.5,
                bgcolor: '#0F172A',
                borderRadius: 1,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 14.5,
                color: '#94A3B8',
                minHeight: 52,
                px: 1.5,
                '&.Mui-selected': { color: '#0F172A' },
              },
            }}
          >
            <Tab
              value="transfers"
              label={`${t('tabs.transfers')} (${totalTransfersCount})`}
            />
            <Tab
              value="earnings"
              label={`${t('tabs.earnings')} (${totalEarningsCount})`}
            />
          </Tabs>
        </Box>

        <Box>
          {activeTab === 'transfers' ? (
            <TransactionsTable
              transactions={transfers}
              totalCount={totalTransfersCount}
              page={transfersPage}
              rowsPerPage={transfersRowsPerPage}
              loading={transfersLoading}
              embedded
              onPageChange={setTransfersPage}
              onRowsPerPageChange={setTransfersRowsPerPage}
              onViewReceipt={handleOpenReceipt}
            />
          ) : (
            <InstructorMyEarningsTable
              items={earnings}
              totalCount={totalEarningsCount}
              loading={earningsLoading}
              page={earningsPage}
              rowsPerPage={earningsRowsPerPage}
              onPageChange={setEarningsPage}
              onRowsPerPageChange={setEarningsRowsPerPage}
            />
          )}
        </Box>
      </Card>

      <RegisterTransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        instructor={instructor}
        onSuccess={handleTransferSuccess}
      />
    </Box>
  );
}
