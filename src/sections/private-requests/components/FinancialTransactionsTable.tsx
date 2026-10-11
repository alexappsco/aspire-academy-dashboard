'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';
import { FinancialTransaction } from 'src/types/private-request';

interface Props {
  requestId: string;
  transactions?: FinancialTransaction[];
  currency?: string;
}

const DEFAULT_DEMO_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: '#TX-9021',
    title: 'محتوى مسجل 1#',
    subtitle: 'Adrenergic Receptors',
    date: '5 أكتوبر 2026 - 03:10 م',
    consumedHours: 0.75,
    hourPrice: 10.0,
    totalDeduction: 7.5,
    instructorEarnings: 5.25,
  },
  {
    id: '#TX-9022',
    title: 'محتوى مسجل 2#',
    subtitle: 'Beta Blockers Mechanisms',
    date: '6 أكتوبر 2026 - 06:45 م',
    consumedHours: 1.0,
    hourPrice: 10.0,
    totalDeduction: 10.0,
    instructorEarnings: 7.0,
  },
  {
    id: '#TX-9023',
    title: 'محتوى مسجل 3#',
    subtitle: 'Clinical Cases & Solved MCQs',
    date: '7 أكتوبر 2026 - 01:20 م',
    consumedHours: 0.5,
    hourPrice: 10.0,
    totalDeduction: 5.0,
    instructorEarnings: 3.5,
  },
];

export default function FinancialTransactionsTable({
  requestId,
  transactions,
  currency = 'جنيه',
}: Props) {
  const displayTransactions =
    transactions && transactions.length > 0 ? transactions : DEFAULT_DEMO_TRANSACTIONS;

  const totalConsumedHours = displayTransactions.reduce(
    (acc, t) => acc + Math.abs(t.consumedHours),
    0
  );
  const totalDeduction = displayTransactions.reduce((acc, t) => acc + t.totalDeduction, 0);
  const totalEarnings = displayTransactions.reduce((acc, t) => acc + t.instructorEarnings, 0);

  const displayId = requestId.length > 12 ? `${requestId.slice(0, 8)}...` : requestId;

  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Table Header Row: Title & Icon on RIGHT (First in RTL), Chip on LEFT (Second in RTL) */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Right in RTL (First child): Title and Icon */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:bill-list-bold" width={22} sx={{ color: '#0D9488' }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 16 }, color: '#0F172A' }}>
            سجل حركات الساعات والعمليات المالية للطلب #{displayId}
          </Typography>
        </Stack>

        {/* Left in RTL (Second child): Chip */}
        <Chip
          label={`${displayTransactions.length} حركات استهلاك مسجلة`}
          size="small"
          sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: 12 }}
        />
      </Box>

      {/* Table Container */}
      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 800,
            textAlign: 'center',
          }}
        >
          {/* thead */}
          <Box component="thead">
            <Box
              component="tr"
              sx={{
                bgcolor: '#F8FAFC',
                '& th': {
                  p: 1.75,
                  color: '#64748B',
                  fontSize: 12.5,
                  fontWeight: 700,
                  borderBottom: '1px solid #F1F5F9',
                },
              }}
            >
              <Box component="th">رقم الحركة</Box>
              <Box component="th" sx={{ textAlign: 'start !important', pr: 3 }}>
                نوع العملية والبيان
              </Box>
              <Box component="th">التاريخ والوقت</Box>
              <Box component="th">المدة المستهلكة</Box>
              <Box component="th">سعر الساعة</Box>
              <Box component="th">إجمالي الخصم</Box>
              <Box component="th">مستحق المحاضر (+70%)</Box>
            </Box>
          </Box>

          {/* tbody */}
          <Box component="tbody">
            {displayTransactions.map((tx) => (
              <Box
                component="tr"
                key={tx.id}
                sx={{
                  borderBottom: '1px solid #F1F5F9',
                  '&:hover': { bgcolor: '#F8FAFC' },
                  '& td': { p: 2, fontSize: 13 },
                }}
              >
                {/* Movement ID */}
                <Box component="td" sx={{ fontWeight: 700, color: '#475569' }}>
                  {tx.id}
                </Box>

                {/* Type & Title */}
                <Box component="td" sx={{ textAlign: 'start !important', pr: 3 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    {tx.title}
                  </Typography>
                  {tx.subtitle && (
                    <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.25 }}>
                      {tx.subtitle}
                    </Typography>
                  )}
                </Box>

                {/* Date */}
                <Box component="td" sx={{ color: '#64748B', fontSize: 12.5 }}>
                  {tx.date}
                </Box>

                {/* Consumed Hours */}
                <Box component="td" sx={{ color: '#DC2626', fontWeight: 800 }}>
                  {Math.abs(tx.consumedHours).toFixed(2)} ساعة
                </Box>

                {/* Hour Price */}
                <Box component="td" sx={{ color: '#475569', fontWeight: 600 }}>
                  {tx.hourPrice.toFixed(2)} {currency}
                </Box>

                {/* Total Deduction */}
                <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                  {tx.totalDeduction.toFixed(2)} {currency}
                </Box>

                {/* Instructor Net Earnings */}
                <Box component="td" sx={{ color: '#059669', fontWeight: 800, fontSize: 13.5 }}>
                  +{tx.instructorEarnings.toFixed(2)} {currency}
                </Box>
              </Box>
            ))}

            {/* Summary Cumulative Row */}
            <Box
              component="tr"
              sx={{
                bgcolor: '#F8FAFC',
                borderTop: '2px solid #E2E8F0',
                '& td': { p: 2.25, fontSize: 13.5, fontWeight: 800 },
              }}
            >
              <Box
                component="td"
                colSpan={3}
                sx={{ textAlign: 'start !important', pr: 3, color: '#0F172A' }}
              >
                الإجمالي التراكمي للطلب:
              </Box>

              <Box component="td" sx={{ color: '#DC2626' }}>
                {totalConsumedHours.toFixed(2)} ساعة
              </Box>

              <Box component="td" sx={{ color: '#94A3B8' }}>
                —
              </Box>

              <Box component="td" sx={{ color: '#0F172A' }}>
                {totalDeduction.toFixed(2)} {currency}
              </Box>

              <Box component="td" sx={{ color: '#059669', fontSize: 14.5 }}>
                +{totalEarnings.toFixed(2)} {currency} صافي
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
