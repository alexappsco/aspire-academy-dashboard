'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

import {
  InstructorWalletDetailsResponse,
  InstructorTransferItem,
} from 'src/types/instructor-wallet';
import {
  getInstructorMyWallet,
  getInstructorMyTransfers,
} from 'src/actions/instructor-wallet';

import InstructorMyBankCard from './components/InstructorMyBankCard';
import InstructorMyBalanceCard from './components/InstructorMyBalanceCard';
import InstructorMyTransfersTable from './components/InstructorMyTransfersTable';
import EditBankDetailsDialog from './components/EditBankDetailsDialog';

export default function InstructorWalletView() {
  const t = useTranslations('InstructorWallet');
  const toast = useToast();

  // Wallet details state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructor, setInstructor] = useState<InstructorWalletDetailsResponse | null>(null);

  // Transfers log state
  const [transfers, setTransfers] = useState<InstructorTransferItem[]>([]);
  const [totalTransfersCount, setTotalTransfersCount] = useState<number>(0);
  const [transfersPage, setTransfersPage] = useState<number>(0);
  const [transfersRowsPerPage, setTransfersRowsPerPage] = useState<number>(10);
  const [transfersLoading, setTransfersLoading] = useState<boolean>(true);

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
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('failed_to_load');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  // 2. Fetch Completed Transfers Log
  const fetchTransfers = useCallback(async () => {
    setTransfersLoading(true);
    try {
      const res = await getInstructorMyTransfers({
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
  }, [transfersPage, transfersRowsPerPage]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // When bank details are updated successfully
  const handleBankDetailsUpdated = () => {
    fetchWallet();
  };

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

        {/* Info Banner */}
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

      {/* Error Alert */}
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

      {/* 2. Top Summary Grid: Bank Info Card (8 cols) & Balance Card (4 cols) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Right (in RTL): Bank Details Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          {loading || !instructor ? (
            <Skeleton
              variant="rectangular"
              height={240}
              sx={{ borderRadius: 3 }}
            />
          ) : (
            <InstructorMyBankCard
              instructor={instructor}
              onOpenEditDialog={() => setEditDialogOpen(true)}
            />
          )}
        </Grid>

        {/* Left (in RTL): Current Balance Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          {loading || !instructor ? (
            <Skeleton
              variant="rectangular"
              height={240}
              sx={{ borderRadius: 3 }}
            />
          ) : (
            <InstructorMyBalanceCard instructor={instructor} />
          )}
        </Grid>
      </Grid>

      {/* 3. Bottom Table: Completed Transfers Log */}
      <Box>
        <InstructorMyTransfersTable
          transactions={transfers}
          totalCount={totalTransfersCount}
          page={transfersPage}
          rowsPerPage={transfersRowsPerPage}
          loading={transfersLoading}
          onPageChange={setTransfersPage}
          onRowsPerPageChange={setTransfersRowsPerPage}
        />
      </Box>

      {/* 4. Edit Bank Details Dialog */}
      {instructor && (
        <EditBankDetailsDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          instructor={instructor}
          onSuccess={handleBankDetailsUpdated}
        />
      )}
    </Box>
  );
}
