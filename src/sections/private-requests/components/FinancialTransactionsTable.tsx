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
}

export default function FinancialTransactionsTable({ requestId, transactions = [] }: Props) {
  const totalConsumedHours = transactions.reduce((acc, t) => acc + t.consumedHours, 0);
  const totalDeduction = transactions.reduce((acc, t) => acc + t.totalDeduction, 0);
  const totalEarnings = transactions.reduce((acc, t) => acc + t.instructorEarnings, 0);

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
      {/* Table Header Row */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Chip
          label={`${transactions.length} حركات استهلاك مسجلة`}
          size="small"
          sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: 12 }}
        />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
            سجل حركات الساعات والعمليات المالية للطلب #{requestId}
          </Typography>
          <Iconify icon="solar:bill-list-bold" width={22} sx={{ color: '#0D9488' }} />
        </Stack>
      </Box>

      {/* Table Container */}
      <Box sx={{ overflowX: 'auto' }}>
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
              <Box component="th" sx={{ textAlign: 'start !important', pr: 3 }}>نوع العملية والبيان</Box>
              <Box component="th">التاريخ والوقت</Box>
              <Box component="th">المدة المستهلكة</Box>
              <Box component="th">سعر الساعة</Box>
              <Box component="th">إجمالي الخصم</Box>
              <Box component="th">مستحق المحاضر (+70%)</Box>
            </Box>
          </Box>

          {/* tbody */}
          <Box component="tbody">
            {transactions.map((tx) => (
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
                  {tx.consumedHours.toFixed(2)} ساعة
                </Box>

                {/* Hour Price */}
                <Box component="td" sx={{ color: '#475569', fontWeight: 600 }}>
                  {tx.hourPrice.toFixed(2)} ج.م
                </Box>

                {/* Total Deduction */}
                <Box component="td" sx={{ color: '#0F172A', fontWeight: 700 }}>
                  {tx.totalDeduction.toFixed(2)} ج.م
                </Box>

                {/* Instructor Net Earnings */}
                <Box component="td" sx={{ color: '#059669', fontWeight: 800, fontSize: 13.5 }}>
                  +{tx.instructorEarnings.toFixed(2)} جنيه
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
              <Box component="td" colSpan={3} sx={{ textAlign: 'start !important', pr: 3, color: '#0F172A' }}>
                الإجمالي التراكمي للطلب:
              </Box>

              <Box component="td" sx={{ color: '#DC2626' }}>
                {totalConsumedHours.toFixed(2)} ساعة
              </Box>

              <Box component="td" sx={{ color: '#94A3B8' }}>
                —
              </Box>

              <Box component="td" sx={{ color: '#0F172A' }}>
                {totalDeduction.toFixed(2)} ج.م
              </Box>

              <Box component="td" sx={{ color: '#059669', fontSize: 14.5 }}>
                +{totalEarnings.toFixed(2)} جنيه صافي
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
