'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import type { InvoiceKpiSummary } from 'src/types/invoice';

interface Props {
  kpis: InvoiceKpiSummary;
}

export default function InvoicesKpiCards({ kpis }: Props) {
  const t = useTranslations('Invoices');

  const cards = [
    {
      id: '04',
      badge: '04',
      badgeColor: '#7E22CE',
      badgeBg: '#F3E8FF',
      label: t('kpi.total_taxes'),
      value: `${kpis.totalTaxesAmount.toLocaleString()} ${t('currency')}`,
      subtitle: t('kpi.total_taxes_sub'),
    },
    {
      id: '03',
      badge: '03',
      badgeColor: '#C2410C',
      badgeBg: '#FFEDD5',
      label: t('kpi.this_month'),
      value: kpis.thisMonthInvoicesCount.toLocaleString(),
      subtitle: t('kpi.this_month_sub'),
    },
    {
      id: '02',
      badge: '02',
      badgeColor: '#15803D',
      badgeBg: '#DCFCE7',
      label: t('kpi.total_amount'),
      value: `${kpis.totalInvoicesAmount.toLocaleString()} ${t('currency')}`,
      subtitle: t('kpi.total_amount_sub'),
    },
    {
      id: '01',
      badge: '01',
      badgeColor: '#0284C7',
      badgeBg: '#E0F2FE',
      label: t('kpi.total_invoices'),
      value: kpis.totalInvoicesCount.toLocaleString(),
      subtitle: t('kpi.total_invoices_sub'),
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid key={card.id} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              bgcolor: '#FFFFFF',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                {card.label}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: 1,
                  bgcolor: card.badgeBg,
                  color: card.badgeColor,
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: 'monospace, sans-serif',
                  lineHeight: 1,
                }}
              >
                {card.badge}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#0F172A',
                  mb: 0.5,
                  letterSpacing: -0.5,
                }}
              >
                {card.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
                {card.subtitle}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
