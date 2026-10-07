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
import { FinancialTerms, ActualConsumption } from 'src/types/private-request';

interface Props {
  terms?: FinancialTerms;
  consumption?: ActualConsumption;
  showKpis?: boolean;
  totalVideosCount?: number;
  totalDeliveredHours?: number;
  earningHours?: number;
  recordedEarnings?: number;
}

export default function FinancialTermsCards({
  terms,
  consumption,
  showKpis = false,
  totalVideosCount = 3,
  totalDeliveredHours = 2.25,
  earningHours = 2.25,
  recordedEarnings = 15.75,
}: Props) {
  const currentTerms = terms || {
    countryName: 'جمهورية مصر العربية',
    countryCode: 'EG',
    currencySymbol: 'جنيه',
    approvedHourPrice: 10.0,
    instructorSharePercent: 70,
    platformSharePercent: 30,
    instructorPerHour: 7.0,
    platformPerHour: 3.0,
  };

  const currentConsumption = consumption || {
    actualHours: 2.25,
    filesCount: 3,
    instructorNetEarnings: 15.75,
    totalExecutedValue: 22.5,
    platformRetainedShare: 6.75,
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 1. Two Main Cards: Approved Financial Terms & Actual Consumption */}
      <Grid container spacing={2.5} sx={{ mb: showKpis ? 2.5 : 0 }}>
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
            {/* Header */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}
            >
              <Chip
                label="جمهورية مصر العربية 🇪🇬"
                size="small"
                sx={{ bgcolor: '#F8FAFC', color: '#475569', fontWeight: 600, fontSize: 11.5 }}
              />

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                  الشروط المالية المعتمدة للطلب
                </Typography>
                <Iconify icon="solar:bill-check-bold" width={20} sx={{ color: '#0D9488' }} />
              </Stack>
            </Stack>

            {/* Row 1: Approved price & Instructor share */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', height: '100%' }}>
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    سعر الساعة المعتمد
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                    {currentTerms.approvedHourPrice.toFixed(2)} {currentTerms.currencySymbol} / ساعة
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
                    سعر موحد ومثبت
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', height: '100%', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 12, left: 12, color: '#94A3B8' }}>
                    <Iconify icon="solar:lock-bold" width={16} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    نسبة المحاضر المعتمدة
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#059669', mt: 0.5 }}>
                    %{currentTerms.instructorSharePercent}
                    <Typography component="span" sx={{ fontSize: 11.5, color: '#64748B', mr: 0.75 }}>
                      (صافي استحقاقك)
                    </Typography>
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
                    حصة المنصة: %{currentTerms.platformSharePercent}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Row 2: Distribution per hour */}
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: 11, color: '#059669', fontWeight: 700, bgcolor: '#ECFDF5', px: 1, py: 0.25, borderRadius: 1 }}>
                  معتمد ومؤمن بالنظام
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                  توزيع استحقاق الساعة الواحدة:
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                  حصة المنصة لكل ساعة (شاملة السيرفرات والإشراف):{' '}
                  <strong style={{ color: '#0F172A' }}>{currentTerms.platformPerHour.toFixed(2)} {currentTerms.currencySymbol} /ساعة</strong>
                </Typography>

                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#059669' }}>
                  قيمة المحاضر لكل ساعة منجزة:{' '}
                  <span>{currentTerms.instructorPerHour.toFixed(2)} {currentTerms.currencySymbol} / ساعة</span>
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
            {/* Header */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 2.5, gap: 1 }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                استهلاك الساعات والأرباح الفعلية
              </Typography>
              <Iconify icon="solar:wallet-money-bold" width={20} sx={{ color: '#059669' }} />
            </Stack>

            {/* Metrics Row */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {/* Actual Hours */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', height: '100%', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    إجمالي الساعات الفعلية
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                    {currentConsumption.actualHours}{' '}
                    <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, color: '#64748B' }}>
                      ساعة
                    </Typography>
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#94A3B8', mt: 0.25 }}>
                    عبر {currentConsumption.filesCount} ملفات مسجلة
                  </Typography>
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
                    صافي مستحق المحاضر (%70)
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#065F46', mt: 0.5 }}>
                    {currentConsumption.instructorNetEarnings}{' '}
                    <Typography component="span" sx={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>
                      جنيه
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
                value={70}
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

              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', fontSize: 12 }}>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  القيمة الإجمالية للخدمة المنفذة:{' '}
                  <strong style={{ color: '#0F172A' }}>{currentConsumption.totalExecutedValue.toFixed(2)} جنيه</strong>
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  حصة المنصة المحتجزة (%30):{' '}
                  <strong style={{ color: '#0F172A' }}>{currentConsumption.platformRetainedShare.toFixed(2)} جنيه</strong>
                </Typography>
              </Stack>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 2. Four KPI Metric Boxes (Image 4) */}
      {showKpis && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                إجمالي الفيديوهات المرفوعة
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                {totalVideosCount} فيديوهات
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                إجمالي الساعات المقدمة
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#0F172A', mt: 0.5 }}>
                {totalDeliveredHours} ساعة
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                الساعات المحتسبة للأرباح
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#0284C7', mt: 0.5 }}>
                {earningHours} ساعة
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Card sx={{ p: 2, borderRadius: 2.5, bgcolor: '#FFFFFF', border: '1px solid #F1F5F9', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                أرباح المحتوى المسجل
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#059669', mt: 0.5 }}>
                {recordedEarnings} جنيه
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
