'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useRouter } from 'src/i18n/routing';
import type { DashboardPendingTasks } from 'src/types/dashboard';

interface Props {
  pendingTasks?: DashboardPendingTasks;
}

export default function NeedsAttentionSection({ pendingTasks }: Props) {
  const t = useTranslations('Home.needs_attention');
  const router = useRouter();

  const hasData = pendingTasks !== undefined;

  const cards = [
    {
      id: 'pending_courses',
      count: hasData ? pendingTasks.coursesPendingReview : 0,
      circleBg: '#EFF6FF',
      circleColor: '#2563EB',
      title: t('card_1.title'),
      desc: hasData
        ? `${pendingTasks.coursesPendingReview} دورة تم إرسالها من المحاضرين وتحتاج إلى مراجعة وتدقيق المحتوى الطبي.`
        : 'No data from backend',
      action: t('card_1.action'),
      actionHref: '/courses?status=pending',
      badge: t('card_1.badge'),
      badgeColor: '#2563EB',
      btnBg: '#2563EB',
      btnColor: '#FFFFFF',
      btnHoverBg: '#1D4ED8',
    },
    {
      id: 'new_lecturers',
      count: hasData ? pendingTasks.newInstructorsPendingVerification : 0,
      circleBg: '#FFFBEB',
      circleColor: '#D97706',
      title: t('card_2.title'),
      desc: hasData
        ? `${pendingTasks.newInstructorsPendingVerification} محاضر تم إنشاء حساباتهم مؤخراً وبانتظار اعتماد التخصص والجامعة.`
        : 'No data from backend',
      action: t('card_2.action'),
      actionHref: '/instructors',
      badge: t('card_2.badge'),
      badgeColor: '#D97706',
      btnBg: '#FEF3C7',
      btnColor: '#B45309',
      btnHoverBg: '#FDE68A',
    },
    {
      id: 'rejected_courses',
      count: hasData ? pendingTasks.rejectedCourses : 0,
      circleBg: '#FEF2F2',
      circleColor: '#DC2626',
      title: t('card_3.title'),
      desc: hasData
        ? `${pendingTasks.rejectedCourses} دورات تحتاج إلى متابعة مع المحاضرين لتعديل ملاحظات الرفض الأكاديمية.`
        : 'No data from backend',
      action: t('card_3.action'),
      actionHref: '/courses?status=rejected',
      badge: t('card_3.badge'),
      badgeColor: '#DC2626',
      btnBg: '#FEE2E2',
      btnColor: '#B91C1C',
      btnHoverBg: '#FECACA',
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Section Header */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        {/* Right side in RTL: Title + Alert Icon */}
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            !
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}
          >
            {t('title')}
          </Typography>
        </Stack>

        {/* Left side in RTL: Subtitle */}
        <Typography
          variant="caption"
          sx={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}
        >
          {t('subtitle')}
        </Typography>
      </Stack>

      {/* 3 Action Cards */}
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.id} size={{ xs: 12, md: 4 }}>
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
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                },
              }}
            >
              {/* Header with Circle Count and Title */}
              <Box>
                <Stack
                  direction="row"
                  spacing={1.75}
                  sx={{ alignItems: 'center', mb: 1.5, gap: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: card.circleBg,
                      color: card.circleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 19,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {hasData ? card.count : '!'}
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}
                  >
                    {card.title}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748B',
                    fontSize: 13,
                    lineHeight: 1.6,
                    mb: 2.5,
                    minHeight: 40,
                  }}
                >
                  {card.desc}
                </Typography>
              </Box>

              {/* Action Button & Status dot */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pt: 1.5,
                  borderTop: '1px solid #F8FAFC',
                }}
              >
                {/* Right side in RTL: Status Dot & Badge */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: card.badgeColor,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: card.badgeColor,
                    }}
                  >
                    {card.badge}
                  </Typography>
                </Stack>

                {/* Left side in RTL: Action Button */}
                <Button
                  size="small"
                  onClick={() => router.push(card.actionHref)}
                  endIcon={
                    <Iconify
                      icon="solar:arrow-left-linear"
                      width={16}
                      sx={{ transform: 'scaleX(var(--rtl-flip, 1))', ml: 0.5 }}
                    />
                  }
                  sx={{
                    bgcolor: card.btnBg,
                    color: card.btnColor,
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.75,
                    fontWeight: 700,
                    fontSize: 13,
                    gap: 0.75,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: card.btnHoverBg,
                    },
                  }}
                >
                  {card.action}
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
