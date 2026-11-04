'use client';

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { InvoiceItem } from 'src/types/invoice';

import { MOCK_INVOICES } from './_mock';
import InvoicesFilters from './components/invoices-filters';
import InvoicesTable from './components/invoices-table';

export default function InvoicesView() {
  const t = useTranslations('Invoices');
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const filteredInvoices = useMemo(() => {
    return MOCK_INVOICES.filter((inv) => {
      // 1. Search filter (by invoiceNumber or studentName or studentEmail)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesNumber = inv.invoiceNumber?.toLowerCase().includes(query);
        const matchesName = inv.studentName?.toLowerCase().includes(query);
        const matchesEmail = inv.studentEmail?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesName && !matchesEmail) {
          return false;
        }
      }

      // 2. Type filter
      if (type && type !== 'all') {
        const lowerType = inv.type?.toLowerCase();
        const lowerFilter = type.toLowerCase();
        if (
          lowerType !== lowerFilter &&
          inv.type !== type &&
          (lowerFilter !== 'course_purchase' || lowerType !== 'purchase') &&
          (lowerFilter !== 'private_charge' || lowerType !== 'privatecharge')
        ) {
          return false;
        }
      }

      // 3. Status filter
      if (status && status !== 'all') {
        const lowerStatus = inv.status?.toLowerCase();
        const lowerFilter = status.toLowerCase();
        if (lowerStatus !== lowerFilter && inv.status !== status) {
          return false;
        }
      }

      return true;
    });
  }, [search, type, status]);

  const handleViewInvoice = (invoice: InvoiceItem) => {
    router.push(paths.invoices.details(invoice.id));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 1. Header (Title and Subtitle in RTL on the Right) */}
      <Box sx={{ mb: 3, textAlign: 'right' }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
          {t('subtitle')}
        </Typography>
      </Box>

      {/* 2. Filters Bar */}
      <InvoicesFilters
        search={search}
        type={type}
        status={status}
        onSearchChange={setSearch}
        onTypeChange={setType}
        onStatusChange={setStatus}
      />

      {/* 3. Invoices Shared Table */}
      <InvoicesTable
        invoices={filteredInvoices}
        totalCount={filteredInvoices.length}
        onViewInvoice={handleViewInvoice}
      />
    </Container>
  );
}
