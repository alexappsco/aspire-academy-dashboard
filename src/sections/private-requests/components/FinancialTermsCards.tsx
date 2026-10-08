'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

interface Props {
  platformPercentage?: number | null;
  totalChapterHours?: number | null;
  effectiveHours?: number | null;
  pricePerHour?: number | null;
  effectiveHoursValue?: number | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
}

export default function FinancialTermsCards({
  platformPercentage = 0,
  totalChapterHours = 0,
  effectiveHours = 0,
  pricePerHour = 0,
  effectiveHoursValue = 0,
  currencyCode,
  currencySymbol,
}: Props) {
  const currency = currencySymbol || currencyCode || '';
  const price = Number(pricePerHour) || 0;
  const platPercent = Number(platformPercentage) || 0;
  const instructorPercent = Math.max(0, 100 - platPercent);

  // Per-hour rates
  const instructorPerHour = price * (instructorPercent / 100);
  const platformPerHour = price * (platPercent / 100);

  // Executed metrics
  const effHours = Number(effectiveHours) || 0;
  const effValue = Number(effectiveHoursValue) || 0;
  const chapHours = Number(totalChapterHours) || 0;
  const instructorNetEarnings = effValue * (instructorPercent / 100);
  const platformRetainedShare = effValue * (platPercent / 100);

  // Progress percentage based on chapter hours or instructor share
  const progressPercent =
    chapHours > 0
      ? Math.min(100, Math.round((effHours / chapHours) * 100))
      : instructorPercent;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2.5}>
        {/* Right Card: الشروط المالية المعتمدة للطلب */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Header: Title and Icon on RIGHT (First in RTL), Currency Chip on LEFT */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Iconify icon="solar:bill-check-bold" width={20} sx={{ color: '#0D9488' }} />
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                  الشروط المالية المعتمدة للطلب
                </Typography>
              </Stack>

              {currency && (
                <Chip
                  label={currency}
                  size="small"
                  sx={{ bgcolor: '#F8FAFC', color: '#475569', fontWeight: 700, fontSize: 11.5 }}
                />
              )}
            </Stack>

            {/* Row 1: Approved price & Instructor share */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    height: '100%',
                    textAlign: 'start',
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    سعر الساعة المعتمد
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                    {price.toFixed(2)} {currency} / ساعة
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
                    سعر موحد ومثبت
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    height: '100%',
                    position: 'relative',
                    textAlign: 'start',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 12, left: 12, color: '#94A3B8' }}>
                    <Iconify icon="solar:lock-bold" width={16} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    نسبة المحاضر المعتمدة
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#059669', mt: 0.5 }}>
                    %{instructorPercent}
                    <Typography component="span" sx={{ fontSize: 11.5, color: '#64748B', mr: 0.75 }}>
                      (صافي استحقاقك)
                    </Typography>
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
                    حصة المنصة: %{platPercent}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Row 2: Distribution per hour */}
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
              >
                <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                  توزيع استحقاق الساعة الواحدة:
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: '#059669',
                    fontWeight: 700,
                    bgcolor: '#ECFDF5',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                  }}
                >
                  معتمد ومؤمن بالنظام
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#059669' }}>
                  قيمة المحاضر لكل ساعة منجزة:{' '}
                  <span>
                    {instructorPerHour.toFixed(2)} {currency} / ساعة
                  </span>
                </Typography>

                <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                  حصة المنصة لكل ساعة:{' '}
                  <strong style={{ color: '#0F172A' }}>
                    {platformPerHour.toFixed(2)} {currency} / ساعة
                  </strong>
                </Typography>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Left Card: استهلاك الساعات والأرباح الفعلية */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Header: Title and Icon on RIGHT (First in RTL) */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'flex-start', mb: 2.5, gap: 1 }}
            >
              <Iconify icon="solar:wallet-money-bold" width={20} sx={{ color: '#059669' }} />
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                استهلاك الساعات والأرباح الفعلية
              </Typography>
            </Stack>

            {/* Metrics Row */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {/* Actual Hours */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    إجمالي الساعات الفعلية
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                    {effHours}{' '}
                    <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>
                      ساعة
                    </Typography>
                  </Typography>
                  {chapHours > 0 && (
                    <Typography sx={{ fontSize: 11.5, color: '#94A3B8', mt: 0.25 }}>
                      من إجمالي {chapHours} ساعة للفصول
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Net Instructor Earnings */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                    صافي مستحق المحاضر (%{instructorPercent})
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#065F46', mt: 0.5 }}>
                    {instructorNetEarnings.toFixed(2)}{' '}
                    <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
                      {currency}
                    </Typography>
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#059669', mt: 0.25, fontWeight: 600 }}>
                    جاهزة للصرف بالمحفظة
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Bottom Progress & Ratio */}
            <Box sx={{ pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#E2E8F0',
                  mb: 1.25,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#0D9488',
                    borderRadius: 4,
                  },
                }}
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between', fontSize: 12, gap: 1 }}
              >
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  القيمة الإجمالية للخدمة المنفذة:{' '}
                  <strong style={{ color: '#0F172A' }}>
                    {effValue.toFixed(2)} {currency}
                  </strong>
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  حصة المنصة المحتجزة (%{platPercent}):{' '}
                  <strong style={{ color: '#0F172A' }}>
                    {platformRetainedShare.toFixed(2)} {currency}
                  </strong>
                </Typography>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
