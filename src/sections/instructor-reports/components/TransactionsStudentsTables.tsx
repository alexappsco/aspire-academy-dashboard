'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Iconify from 'src/components/iconify';

import type { InstructorRecentTransaction, InstructorTopStudent } from 'src/types/instructor-reports';

const PRIMARY = '#2563EB';
const CARD_BORDER = '#E0E0E0';

interface Props {
  recentTransactions?: InstructorRecentTransaction[];
  topStudents?: InstructorTopStudent[];
}

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function EmptyState({ message }: { message: string }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', py: 4 }}>
      <Iconify icon="solar:inbox-line" width={28} sx={{ color: '#CBD5E1' }} />
      <Typography sx={{ color: '#9CA3AF', fontSize: 13 }}>{message}</Typography>
    </Stack>
  );
}

export default function TransactionsStudentsTables({ recentTransactions, topStudents }: Props) {
  const tTransactions = useTranslations('InstructorReports.transactions');
  const tStudents = useTranslations('InstructorReports.top_students');

  const transactions = recentTransactions ?? [];
  const students = topStudents ?? [];

  const tableHeaderSx = {
    bgcolor: '#F8F9FA',
    py: 1,
    px: 1.25,
    borderBottom: `1px solid ${CARD_BORDER}`,
  };

  const tableCellSx = {
    py: 1.25,
    px: 1.25,
    borderBottom: '1px solid #F1F5F9',
  };

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {/* Recent Transactions */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
                {tTransactions('title')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11 }}>
                {tTransactions('subtitle')}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            {transactions.length > 0 ? (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <Box component="thead">
                  <Box component="tr">
                    {[
                      tTransactions('columns.student'),
                      tTransactions('columns.course'),
                      tTransactions('columns.amount'),
                      tTransactions('columns.date'),
                    ].map((col) => (
                      <Box
                        key={col}
                        component="th"
                        sx={{
                          ...tableHeaderSx,
                          textAlign: 'right',
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#9CA3AF',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {transactions.map((tx) => (
                    <Box component="tr" key={tx.id}>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                          {tx.studentName || '—'}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {tx.courseTitle || '—'}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, fontWeight: 700, color: PRIMARY, textAlign: 'right' }}>
                        ${(tx.amount ?? 0).toLocaleString()}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {formatDate(tx.date)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <EmptyState message={tTransactions('empty')} />
            )}
          </Box>
        </Card>
      </Grid>

      {/* Top Students */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            bgcolor: '#FFFFFF',
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: 15 }}>
                {tStudents('title')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', fontSize: 11 }}>
                {tStudents('subtitle')}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ overflowX: 'auto' }}>
            {students.length > 0 ? (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <Box component="thead">
                  <Box component="tr">
                    {[
                      tStudents('columns.student'),
                      tStudents('columns.lessons'),
                      tStudents('columns.completion'),
                      tStudents('columns.rating'),
                      tStudents('columns.amount'),
                    ].map((col) => (
                      <Box
                        key={col}
                        component="th"
                        sx={{
                          ...tableHeaderSx,
                          textAlign: 'right',
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#9CA3AF',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {students.map((student) => (
                    <Box component="tr" key={student.id}>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Avatar
                            src={student.imageUrl ?? undefined}
                            sx={{ width: 28, height: 28, bgcolor: '#E6F7F2', color: PRIMARY, fontSize: 11, fontWeight: 700 }}
                          >
                            {(student.name ?? '?').charAt(0)}
                          </Avatar>
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                            {student.name || '—'}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {student.lessonsCount ?? 0}
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, color: '#475569', textAlign: 'right' }}>
                        {student.completionPercent ?? 0}%
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, textAlign: 'right' }}>
                        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Iconify icon="solar:star-bold" width={14} sx={{ color: '#FF9F1C' }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>
                            {(student.rating ?? 0) > 0 ? (student.rating as number).toFixed(1) : '—'}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box component="td" sx={{ ...tableCellSx, fontSize: 12, fontWeight: 700, color: PRIMARY, textAlign: 'right' }}>
                        ${(student.totalAmountPaid ?? 0).toLocaleString()}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <EmptyState message={tStudents('empty')} />
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
}