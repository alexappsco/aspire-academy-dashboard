'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { useQuery } from 'src/components/use-query';
import { tableRowsPerPageOptions } from 'src/components/constant';
import { InstructorEarningItem } from 'src/types/instructor-wallet';

interface Props {
  items: InstructorEarningItem[];
  totalCount: number;
  loading?: boolean;
  /** Controlled pagination (0-indexed). When provided with handlers, URL params are ignored. */
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

function formatMoney(amount: number, currency: string) {
  return (
    <Box component="span" sx={{ direction: 'ltr', display: 'inline-block' }}>
      {amount.toLocaleString()} {currency}
    </Box>
  );
}

export default function InstructorMyEarningsTable({
  items,
  totalCount,
  loading = false,
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  const t = useTranslations('InstructorWallet.earnings');
  const tGlobal = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { set: setQueries } = useQuery(['page', 'limit'], { replace: true });

  const isControlled = typeof onPageChange === 'function';
  const page = isControlled
    ? (controlledPage ?? 0)
    : Math.max(0, Number(searchParams.get('page') || 1) - 1);
  const limit = isControlled
    ? (controlledRowsPerPage ?? 10)
    : Number(searchParams.get('limit') || 10);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const currencyOf = (row: InstructorEarningItem) =>
    row.currencySymbol || row.currencyCode || '';

  const canExpand = (row: InstructorEarningItem) =>
    (row.studentBreakdown?.length ?? 0) > 1 ||
    (row.partyType !== 'Individual' && (row.studentBreakdown?.length ?? 0) > 0);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatHours = (hours: number, breakdownCount?: number) => {
    const hoursLabel = t('hours', { count: hours });
    if (breakdownCount && breakdownCount > 1 && hours > 0) {
      const perStudent = hours / breakdownCount;
      const per = Number.isInteger(perStudent)
        ? perStudent
        : Number(perStudent.toFixed(2));
      return t('hours_with_breakdown', {
        hoursLabel,
        count: breakdownCount,
        each: per,
      });
    }
    return hoursLabel;
  };

  const partyLabel = (row: InstructorEarningItem) => {
    const breakdownCount = row.studentBreakdown?.length ?? 0;
    if (row.partyType === 'Individual' || breakdownCount <= 1) {
      return t('party_individual', { name: row.studentName || '—' });
    }
    return t('party_group', { count: breakdownCount || 0 });
  };

  /** SessionTypeEnum: Live = 1, Recorded = 2 */
  const isLiveSession = (type: InstructorEarningItem['type']) =>
    type === 1 || type === '1' || type === 'Live';

  const serviceChip = (type: InstructorEarningItem['type']) => {
    const isLive = isLiveSession(type);
    return (
      <Chip
        label={isLive ? t('type_live') : t('type_recorded')}
        size="small"
        sx={{
          bgcolor: isLive ? '#DBEAFE' : '#F1F5F9',
          color: isLive ? '#1D4ED8' : '#475569',
          fontWeight: 700,
          fontSize: 12,
          height: 24,
          borderRadius: 1.5,
        }}
      />
    );
  };

  const thSx = {
    p: 2,
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: 700,
    textAlign: 'start' as const,
    borderBottom: '1px solid #F1F5F9',
    whiteSpace: 'nowrap' as const,
  };

  const tdSx = {
    p: 2,
    borderBottom: '1px solid #F1F5F9',
    verticalAlign: 'middle' as const,
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(255,255,255,0.72)',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 980,
          }}
        >
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: '#F8FAFC' }}>
              <Box component="th" sx={thSx}>
                {t('col_date')}
              </Box>
              <Box component="th" sx={thSx}>
                {t('col_request_student')}
              </Box>
              <Box component="th" sx={{ ...thSx, textAlign: 'center' }}>
                {t('col_service')}
              </Box>
              <Box component="th" sx={thSx}>
                {t('col_hours')}
              </Box>
              <Box component="th" sx={thSx}>
                {t('col_price_per_hour')}
              </Box>
              <Box component="th" sx={thSx}>
                {t('col_total_value')}
              </Box>
              <Box component="th" sx={{ ...thSx, textAlign: 'center' }}>
                {t('col_instructor_pct')}
              </Box>
              <Box component="th" sx={thSx}>
                {t('col_instructor_profit')}
              </Box>
            </Box>
          </Box>

          <Box component="tbody">
            {!loading && items.length === 0 ? (
              <Box component="tr">
                <Box
                  component="td"
                  colSpan={8}
                  sx={{ ...tdSx, py: 6, textAlign: 'center', color: '#94A3B8' }}
                >
                  {t('no_earnings')}
                </Box>
              </Box>
            ) : (
              items.map((row) => {
                const expand = canExpand(row);
                const isOpen = expandedIds.has(row.sessionRequestId);
                const currency = currencyOf(row);
                const breakdownCount = row.studentBreakdown?.length ?? 0;

                return (
                  <React.Fragment key={row.sessionRequestId}>
                    <Box
                      component="tr"
                      sx={{
                        '&:hover': { bgcolor: '#FAFBFC' },
                        bgcolor: isOpen ? '#FAFBFC' : 'transparent',
                      }}
                    >
                      <Box component="td" sx={tdSx}>
                        <Typography sx={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
                          {formatDate(row.creationTime)}
                        </Typography>
                      </Box>

                      <Box component="td" sx={tdSx}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                          {expand && (
                            <IconButton
                              size="small"
                              onClick={() => toggleExpand(row.sessionRequestId)}
                              sx={{
                                p: 0.25,
                                mt: 0.1,
                                color: '#64748B',
                                transform: isOpen ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                              }}
                            >
                              <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          )}
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 13.5,
                                fontWeight: 800,
                                color: '#0F172A',
                                fontFamily: 'monospace',
                              }}
                            >
                              {row.requestNumber || '—'}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: '#64748B', mt: 0.25 }}>
                              {partyLabel(row)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box component="td" sx={{ ...tdSx, textAlign: 'center' }}>
                        {serviceChip(row.type)}
                      </Box>

                      <Box component="td" sx={tdSx}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                          {formatHours(row.hoursConsumed, expand ? breakdownCount : undefined)}
                        </Typography>
                      </Box>

                      <Box component="td" sx={tdSx}>
                        <Typography sx={{ fontSize: 13, color: '#0F172A', whiteSpace: 'nowrap' }}>
                          {formatMoney(row.pricePerHour, currency)}
                        </Typography>
                      </Box>

                      <Box component="td" sx={tdSx}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#0F172A',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatMoney(row.totalValue, currency)}
                        </Typography>
                      </Box>

                      <Box component="td" sx={{ ...tdSx, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                          {row.instructorPercentage}%
                        </Typography>
                      </Box>

                      <Box component="td" sx={tdSx}>
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: 800,
                            color: '#16A34A',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatMoney(row.instructorAmount, currency)}
                        </Typography>
                      </Box>
                    </Box>

                    {expand && (
                      <Box component="tr">
                        <Box
                          component="td"
                          colSpan={8}
                          sx={{ p: 0, borderBottom: '1px solid #F1F5F9' }}
                        >
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ bgcolor: '#F8FAFC', px: 2.5, py: 2 }}>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: '#334155',
                                  mb: 1.5,
                                  textAlign: 'start',
                                }}
                              >
                                {t('breakdown_title', {
                                  requestNumber: row.requestNumber || row.sessionRequestId,
                                })}
                              </Typography>

                              <Box
                                component="table"
                                sx={{
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  bgcolor: '#FFFFFF',
                                  borderRadius: 2,
                                  overflow: 'hidden',
                                  border: '1px solid #E2E8F0',
                                }}
                              >
                                <Box component="thead">
                                  <Box component="tr" sx={{ bgcolor: '#F1F5F9' }}>
                                    <Box component="th" sx={{ ...thSx, fontSize: 12 }}>
                                      {t('col_student_name')}
                                    </Box>
                                    <Box component="th" sx={{ ...thSx, fontSize: 12 }}>
                                      {t('col_hours')}
                                    </Box>
                                    <Box component="th" sx={{ ...thSx, fontSize: 12 }}>
                                      {t('col_price_per_hour')}
                                    </Box>
                                    <Box component="th" sx={{ ...thSx, fontSize: 12 }}>
                                      {t('col_breakdown_total')}
                                    </Box>
                                    <Box component="th" sx={{ ...thSx, fontSize: 12 }}>
                                      {t('col_breakdown_profit', {
                                        pct: row.instructorPercentage,
                                      })}
                                    </Box>
                                  </Box>
                                </Box>
                                <Box component="tbody">
                                  {(row.studentBreakdown || []).map((student) => (
                                    <Box
                                      component="tr"
                                      key={student.studentId}
                                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                                    >
                                      <Box component="td" sx={{ ...tdSx, py: 1.5 }}>
                                        <Typography
                                          sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}
                                        >
                                          {student.studentName}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ ...tdSx, py: 1.5 }}>
                                        <Typography sx={{ fontSize: 13, color: '#334155' }}>
                                          {t('hours', { count: student.hoursConsumed })}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ ...tdSx, py: 1.5 }}>
                                        <Typography
                                          sx={{
                                            fontSize: 13,
                                            color: '#334155',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {formatMoney(student.pricePerHour, currency)}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ ...tdSx, py: 1.5 }}>
                                        <Typography
                                          sx={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: '#0F172A',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {formatMoney(student.totalValue, currency)}
                                        </Typography>
                                      </Box>
                                      <Box component="td" sx={{ ...tdSx, py: 1.5 }}>
                                        <Typography
                                          sx={{
                                            fontSize: 13,
                                            fontWeight: 800,
                                            color: '#16A34A',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {formatMoney(student.instructorAmount, currency)}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      </Box>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={limit}
        onPageChange={(_e, newPage) => {
          if (isControlled && onPageChange) {
            onPageChange(newPage);
            return;
          }
          setQueries({ page: String(newPage + 1) }, { replace: false });
        }}
        onRowsPerPageChange={(e) => {
          const next = parseInt(e.target.value, 10);
          if (isControlled) {
            onRowsPerPageChange?.(next);
            onPageChange?.(0);
            return;
          }
          setQueries({ limit: e.target.value, page: '1' });
        }}
        rowsPerPageOptions={tableRowsPerPageOptions}
        labelRowsPerPage={tGlobal('Global.Sections.Table.rows_per_page')}
        labelDisplayedRows={({ from, to, count: rows }) =>
          `${from}-${to} ${tGlobal('Global.Sections.Table.of')} ${
            rows !== -1
              ? rows
              : `${tGlobal('Global.Sections.Table.more_than')} ${to}`
          }`
        }
        sx={{ borderTop: '1px solid #F1F5F9' }}
      />
    </Box>
  );
}
