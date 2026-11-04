'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment, headCellType } from 'src/components/SharedTable/types';
import type { InvoiceItem } from 'src/types/invoice';

interface Props {
  invoices: InvoiceItem[];
  totalCount: number;
  onViewInvoice: (invoice: InvoiceItem) => void;
}

export default function InvoicesTable({ invoices, totalCount, onViewInvoice }: Props) {
  const t = useTranslations('Invoices');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getTypeLabel = (type: string, typeLabel?: string) => {
    if (typeLabel) return typeLabel;
    const lower = type.toLowerCase();
    if (lower === 'purchase') return t('filters.types.course_purchase');
    if (lower === 'privatecharge' || lower === 'private_charge') {
      return t('filters.types.private_charge');
    }
    return type;
  };

  const getStatusLabel = (status: string, statusLabel?: string) => {
    if (statusLabel) return statusLabel;
    const lower = status.toLowerCase();
    if (lower === 'issued') return t('filters.statuses.issued');
    if (lower === 'cancelled') return t('filters.statuses.cancelled');
    return status;
  };

  const tableHead: headCellType[] = [
    {
      id: 'invoiceNumber',
      label: t('table.columns.invoice_number'),
      align: cellAlignment.center,
    },
    {
      id: 'studentName',
      label: t('table.columns.student_name'),
      align: cellAlignment.right,
    },
    {
      id: 'type',
      label: t('table.columns.type'),
      align: cellAlignment.center,
    },
    {
      id: 'issuedAt',
      label: t('table.columns.date'),
      align: cellAlignment.center,
    },
    {
      id: 'amountBeforeTax',
      label: t('table.columns.subtotal'),
      align: cellAlignment.center,
    },
    {
      id: 'discountAmount',
      label: t('table.columns.discount'),
      align: cellAlignment.center,
    },
    {
      id: 'taxAmount',
      label: t('table.columns.tax'),
      align: cellAlignment.center,
    },
    {
      id: 'total',
      label: t('table.columns.total'),
      align: cellAlignment.center,
    },
    {
      id: 'status',
      label: t('table.columns.status'),
      align: cellAlignment.center,
    },
    {
      id: 'actions',
      label: t('table.columns.actions'),
      align: cellAlignment.center,
    },
  ];

  const customRender = {
    invoiceNumber: (row: InvoiceItem) => (
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 700,
          color: '#0F172A',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace, sans-serif',
        }}
      >
        {row.invoiceNumber}
      </Typography>
    ),
    studentName: (row: InvoiceItem) => (
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          {row.studentName}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
          {row.studentEmail}
        </Typography>
      </Box>
    ),
    type: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {getTypeLabel(row.type, row.typeLabel)}
      </Typography>
    ),
    issuedAt: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
        {formatDate(row.issuedAt)}
      </Typography>
    ),
    amountBeforeTax: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.amountBeforeTax.toLocaleString()}
      </Typography>
    ),
    discountAmount: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: row.discountAmount > 0 ? '#15803D' : '#64748B', whiteSpace: 'nowrap' }}>
        {row.discountAmount.toLocaleString()}
      </Typography>
    ),
    taxAmount: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.taxAmount.toLocaleString()}
      </Typography>
    ),
    total: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.total.toLocaleString()} {row.currencyCode}
      </Typography>
    ),
    status: (row: InvoiceItem) => {
      const isIssued = row.status?.toLowerCase() === 'issued' || row.status === 'صادرة';
      return (
        <Chip
          label={getStatusLabel(row.status, row.statusLabel)}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: 12,
            borderRadius: 1,
            height: 26,
            px: 1,
            bgcolor: isIssued ? '#DCFCE7' : '#FFE4E6',
            color: isIssued ? '#15803D' : '#BE123C',
          }}
        />
      );
    },
    actions: (row: InvoiceItem) => (
      <Button
        size="small"
        onClick={() => onViewInvoice(row)}
        sx={{
          minWidth: 'auto',
          px: 1.5,
          py: 0.5,
          fontSize: 13,
          fontWeight: 700,
          color: '#0F172A',
          bgcolor: 'transparent',
          borderRadius: 1,
          '&:hover': {
            bgcolor: '#F1F5F9',
            textDecoration: 'underline',
          },
        }}
      >
        {t('table.actions.view')}
      </Button>
    ),
  };

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        bgcolor: '#FFFFFF',
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Box sx={{ mb: 2, textAlign: 'right' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0F172A', mb: 0.25 }}>
          {t('table.title')}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 500 }}>
          {t('table.subtitle')}
        </Typography>
      </Box>

      <SharedTable<InvoiceItem>
        data={invoices}
        count={totalCount}
        tableHead={tableHead}
        customRender={customRender}
      />
    </Card>
  );
}
