'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useQuery } from 'src/components/use-query';

import {
  InstructorWalletDetailsResponse,
  InstructorTransferItem,
  InstructorEarningItem,
} from 'src/types/instructor-wallet';
import {
  getInstructorMyWallet,
  getInstructorMyTransfers,
  getInstructorMyEarnings,
} from 'src/actions/instructor-wallet';

import InstructorMyBankCard from './components/InstructorMyBankCard';
import InstructorMyBalanceCard from './components/InstructorMyBalanceCard';
import InstructorMyTransfersTable from './components/InstructorMyTransfersTable';
import InstructorMyEarningsTable from './components/InstructorMyEarningsTable';
import EditBankDetailsDialog from './components/EditBankDetailsDialog';

type WalletLogTab = 'transfers' | 'earnings';

const DEFAULT_EMPTY_INSTRUCTOR: InstructorWalletDetailsResponse = {
  instructorId: '',
  instructorName: '',
  instructorTitle: '',
  instructorImageUrl: null,
  dueNow: 0,
  totalProfits: 0,
  totalTransferred: 0,
  transferredPercent: 0,
  currencyId: '',
  currencyCode: '',
  currencySymbol: '',
  iban: '',
  bankName: '',
  bankAccountHolderName: '',
  bankDetailsUpdatedAt: null,
  hasCompleteBankDetails: false,
  instructorPhoneNumber: '',
  instructorEmail: '',
};

export default function InstructorWalletView() {
  const t = useTranslations('InstructorWallet');
  const searchParams = useSearchParams();
  const { set: setQueries } = useQuery(['page', 'limit', 'tab'], { replace: true });

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const activeTab: WalletLogTab =
    searchParams.get('tab') === 'earnings' ? 'earnings' : 'transfers';

  // Wallet details state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<InstructorWalletDetailsResponse | null>(null);

  // Transfers log state
  const [transfers, setTransfers] = useState<InstructorTransferItem[]>([]);
  const [totalTransfersCount, setTotalTransfersCount] = useState<number>(0);
  const [transfersLoading, setTransfersLoading] = useState<boolean>(true);

  // Earnings log state
  const [earnings, setEarnings] = useState<InstructorEarningItem[]>([]);
  const [totalEarningsCount, setTotalEarningsCount] = useState<number>(0);
  const [earningsLoading, setEarningsLoading] = useState<boolean>(true);

  // Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 1. Fetch Instructor Wallet Details
  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInstructorMyWallet();
      if (res.success && res.data) {
        setInstructor(res.data);
      } else {
        const errorMsg = res.error || t('failed_to_load');
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('failed_to_load');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 2. Fetch Completed Transfers Log
  const fetchTransfers = useCallback(async () => {
    setTransfersLoading(true);
    try {
      const res = await getInstructorMyTransfers({
        SkipCount: (page - 1) * limit,
        MaxResultCount: limit,
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
  }, [page, limit]);

  // 3. Fetch Earnings / Profit Log
  const fetchEarnings = useCallback(async () => {
    setEarningsLoading(true);
    try {
      const res = await getInstructorMyEarnings({
        SkipCount: (page - 1) * limit,
        MaxResultCount: limit,
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
  }, [page, limit]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

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

  // Prefetch the other tab's count once (for badge) on first load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (activeTab === 'transfers') {
          const res = await getInstructorMyEarnings({ SkipCount: 0, MaxResultCount: 1 });
          if (!cancelled && res.success && res.data) {
            setTotalEarningsCount(res.data.items?.totalCount || 0);
          }
        } else {
          const res = await getInstructorMyTransfers({ SkipCount: 0, MaxResultCount: 1 });
          if (!cancelled && res.success && res.data) {
            setTotalTransfersCount(res.data.totalCount || 0);
          }
        }
      } catch {
        // ignore count prefetch errors
      }
    })();
    return () => {
      cancelled = true;
    };
    // Only once on mount for the inactive tab badge
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, value: WalletLogTab) => {
    setQueries({ tab: value, page: '1' }, { replace: true });
  };

  const handleBankDetailsUpdated = () => {
    fetchWallet();
  };

  const displayInstructor = instructor || DEFAULT_EMPTY_INSTRUCTOR;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      {/* 1. Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 22, md: 26 },
            color: '#0F172A',
            textAlign: 'start',
            mb: 2,
          }}
        >
          {t('title')}
        </Typography>

        <Alert
          severity="info"
          icon={<Iconify icon="solar:info-circle-bold" width={22} />}
          sx={{
            borderRadius: 2.5,
            bgcolor: '#F8FAFC',
            color: '#334155',
            border: '1px solid #E2E8F0',
            '& .MuiAlert-icon': { color: '#0284C7' },
            fontSize: 13.5,
            fontWeight: 600,
            textAlign: 'start',
          }}
        >
          {t('info_notice')}
        </Alert>
      </Box>

      {error && !loading && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchWallet}
              startIcon={<Iconify icon="solar:restart-bold" />}
            >
              {t('retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 2. Top Summary Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
          ) : (
            <InstructorMyBankCard
              instructor={displayInstructor}
              onOpenEditDialog={() => setEditDialogOpen(true)}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {loading ? (
            <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 3 }} />
          ) : (
            <InstructorMyBalanceCard instructor={displayInstructor} />
          )}
        </Grid>
      </Grid>

      {/* 3. Logs: Transfers + Earnings tabs */}
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
            <InstructorMyTransfersTable
              transactions={transfers}
              totalCount={totalTransfersCount}
              loading={transfersLoading}
              embedded
            />
          ) : (
            <InstructorMyEarningsTable
              items={earnings}
              totalCount={totalEarningsCount}
              loading={earningsLoading}
            />
          )}
        </Box>
      </Card>

      <EditBankDetailsDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        instructor={displayInstructor}
        onSuccess={handleBankDetailsUpdated}
      />
    </Box>
  );
}
