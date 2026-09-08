'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import type { DashboardCourseStatusItem } from 'src/types/dashboard';

interface Props {
  courseStatusDistribution?: DashboardCourseStatusItem[];
}

export default function CoursesBreakdownCard({ courseStatusDistribution }: Props) {
  const t = useTranslations('Home.courses_breakdown');
  const router = useRouter();

  const parseStatusToString = (status: string | number | undefined | null): string => {
    if (status === null || status === undefined) return '';
    if (typeof status === 'number') {
      switch (status) {
        case 0:
          return 'Draft';
        case 1:
          return 'Pending';
        case 2:
          return 'Published';
        case 3:
          return 'Rejected';
        case 4:
          return 'Paused';
        default:
          return String(status);
      }
    }
    return String(status);
  };

  const getStatusColor = (status: string | number | undefined | null, idx: number) => {
    const s = parseStatusToString(status).toLowerCase();
    if (s.includes('publish') || s.includes('منشور')) return '#10B981';
    if (s.includes('pend') || s.includes('مراجعة') || s.includes('انتظار')) return '#F59E0B';
    if (s.includes('draft') || s.includes('مسود')) return '#2563EB';
    if (s.includes('reject') || s.includes('مرفوض')) return '#EF4444';
    if (s.includes('pause') || s.includes('archiv') || s.includes('متوقف')) return '#94A3B8';
    const fallbackPalette = ['#10B981', '#F59E0B', '#2563EB', '#EF4444', '#8B5CF6', '#EC4899'];
    return fallbackPalette[idx % fallbackPalette.length];
  };

  const getStatusLabel = (status: string | number | undefined | null) => {
    const s = parseStatusToString(status).toLowerCase();
    if (s.includes('publish')) return t('published');
    if (s.includes('pend')) return t('in_review');
    if (s.includes('draft')) return t('drafts');
    if (s.includes('reject')) return t('rejected');
    if (s.includes('pause')) return t('paused');
    return parseStatusToString(status);
  };

  const hasData =
    courseStatusDistribution !== undefined && courseStatusDistribution.length > 0;

  const totalCourses = hasData
    ? courseStatusDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0)
    : 0;

  return (
    <Card
      sx={{
        p: 2.5,
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
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5,
          }}
        >
          {/* Right in RTL: Icon & Title */}
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:pie-chart-2-bold" width={18} />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
            >
              {t('title')}
            </Typography>
          </Stack>

          {/* Left in RTL: View All */}
          <Button
            size="small"
            onClick={() => router.push('/courses')}
            sx={{ color: '#2563EB', fontWeight: 700, fontSize: 13, p: 0, minWidth: 'auto' }}
          >
            {t('view_all')}
          </Button>
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: '#64748B', fontSize: 12, fontWeight: 500, display: 'block' }}
        >
          {hasData
            ? `التوزيع التفصيلي لحالات ${totalCourses} دورة`
            : 'No data from backend'}
        </Typography>
      </Box>

      {hasData ? (
        <>
          {/* Multi-Segment Color Bar */}
          <Box
            sx={{
              height: 10,
              borderRadius: 2,
              display: 'flex',
              overflow: 'hidden',
              my: 1.5,
              bgcolor: '#F1F5F9',
            }}
          >
            {courseStatusDistribution.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  width: `${item.percent || 0}%`,
                  bgcolor: getStatusColor(item.status, idx),
                  height: '100%',
                }}
              />
            ))}
          </Box>

          {/* Itemized Breakdown List */}
          <Stack spacing={1.5} sx={{ my: 1 }}>
            {courseStatusDistribution.map((item, idx) => {
              const color = getStatusColor(item.status, idx);
              return (
                <Stack
                  key={idx}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {/* Right in RTL: Dot & Label */}
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: color,
                      }}
                    />
                    <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
                      {getStatusLabel(item.status)}
                    </Typography>
                  </Stack>

                  {/* Left in RTL: Count & Percentage */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{ fontSize: 14, color: '#0F172A', fontWeight: 800, minWidth: 30 }}
                    >
                      {item.count ?? 0}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, minWidth: 40 }}
                    >
                      {item.percent ?? 0}%
                    </Typography>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </>
      ) : (
        <Box
          sx={{
            py: 4,
            textAlign: 'center',
            bgcolor: '#F8FAFC',
            borderRadius: 2,
            border: '1px dashed #CBD5E1',
            my: 2,
          }}
        >
          <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600 }}>
            No data from backend
          </Typography>
        </Box>
      )}

      {/* Bottom Button */}
      <Button
        fullWidth
        onClick={() => router.push('/courses')}
        endIcon={<Iconify icon="solar:arrow-left-linear" width={16} sx={{ ml: 0.5 }} />}
        sx={{
          mt: 2,
          bgcolor: '#F8FAFC',
          color: '#2563EB',
          borderRadius: 2,
          py: 1,
          gap: 1,
          fontWeight: 700,
          fontSize: 13.5,
          border: '1px solid #E2E8F0',
          '&:hover': {
            bgcolor: '#EFF6FF',
            borderColor: '#BFDBFE',
          },
        }}
      >
        {t('view_all_courses_btn')}
      </Button>
    </Card>
  );
}
