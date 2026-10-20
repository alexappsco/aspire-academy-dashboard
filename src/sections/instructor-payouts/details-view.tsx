'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

import { paths } from 'src/routes/paths';
import { InstructorPayoutItem, PayoutTransaction } from 'src/types/instructor-payout';
import { INITIAL_INSTRUCTORS } from './mock-data';
import InstructorBankInfoCard from './components/InstructorBankInfoCard';
import InstructorBalanceCard from './components/InstructorBalanceCard';
import TransactionsTable from './components/TransactionsTable';
import RegisterTransferDialog from './components/RegisterTransferDialog';
import ReceiptPreviewDialog from './components/ReceiptPreviewDialog';

interface Props {
  instructorId: string;
}

export default function InstructorPayoutDetailsView({ instructorId }: Props) {
  const t = useTranslations('InstructorPayouts.details');
  const locale = useLocale();

  // Find instructor from mock data or fallback to the first one (Ahmed Mahmoud)
  const initialInstructor =
    INITIAL_INSTRUCTORS.find((i) => i.id === instructorId) || INITIAL_INSTRUCTORS[0];

  const [instructor, setInstructor] = useState<InstructorPayoutItem>(initialInstructor);

  // Dialog States
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<PayoutTransaction | null>(null);

  // Handler when transfer is registered in dialog
  const handleTransferSuccess = (
    newTx: PayoutTransaction,
    transferredAmount: number
  ) => {
    setInstructor((prev) => {
      const updatedDue = Math.max(0, prev.dueNow - transferredAmount);
      const updatedTransferred = prev.totalTransferred + transferredAmount;
      const updatedTransactions = [newTx, ...(prev.transactions || [])];

      return {
        ...prev,
        dueNow: updatedDue,
        totalTransferred: updatedTransferred,
        lastTransferDate: newTx.date,
        transactions: updatedTransactions,
      };
    });
  };

  const handleOpenReceipt = (tx: PayoutTransaction) => {
    setSelectedReceiptTx(tx);
    setReceiptDialogOpen(true);
  };

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
          {instructor.name}
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
        {t('page_title', { name: instructor.name })}
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

      {/* 4. Financial Transactions Log Table */}
      <TransactionsTable
        transactions={instructor.transactions || []}
        onViewReceipt={handleOpenReceipt}
      />

      {/* 5. Modals */}
      <RegisterTransferDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        instructor={instructor}
        onSuccess={handleTransferSuccess}
      />

      <ReceiptPreviewDialog
        open={receiptDialogOpen}
        onClose={() => {
          setReceiptDialogOpen(false);
          setSelectedReceiptTx(null);
        }}
        transaction={selectedReceiptTx}
      />
    </Box>
  );
}
