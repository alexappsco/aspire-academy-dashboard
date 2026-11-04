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
      id: 'date',
      label: t('table.columns.date'),
      align: cellAlignment.center,
    },
    {
      id: 'subtotal',
      label: t('table.columns.subtotal'),
      align: cellAlignment.center,
    },
    {
      id: 'tax',
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
        {row.typeLabel}
      </Typography>
    ),
    date: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
        {row.date}
      </Typography>
    ),
    subtotal: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.subtotal.toLocaleString()}
      </Typography>
    ),
    tax: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.tax.toLocaleString()}
      </Typography>
    ),
    total: (row: InvoiceItem) => (
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.total.toLocaleString()} {row.currency}
      </Typography>
    ),
    status: (row: InvoiceItem) => {
      const isIssued = row.status === 'issued';
      return (
        <Chip
          label={row.statusLabel}
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
