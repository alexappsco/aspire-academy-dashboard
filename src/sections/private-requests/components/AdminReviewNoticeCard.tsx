'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Iconify from 'src/components/iconify';

export default function AdminReviewNoticeCard() {
  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #FEF3C7',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        mb: 3,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        {/* Right Side in RTL (First child): Notice Details & Icon */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flex: 1, gap: 2 }}>
          {/* Yellow Icon Box on FAR RIGHT */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:clipboard-check-bold" width={26} />
          </Box>

          {/* Text Content */}
          <Box sx={{ flex: 1, textAlign: 'start' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75, gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 800, fontSize: 16.5, color: '#0F172A' }}>
                بانتظار مراجعة واعتماد الإدارة الأكاديمية
              </Typography>
              <Chip
                label="قيد التدقيق المؤسسي"
                size="small"
                sx={{
                  bgcolor: '#FEF3C7',
                  color: '#92400E',
                  fontWeight: 700,
                  fontSize: 11.5,
                  borderRadius: 1.5,
                }}
              />
            </Stack>

            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#334155', mb: 0.75 }}>
              تم قبول الطلب من المحاضر، والطلب الآن قيد التدقيق الإداري وتحديد الشروط المالية المعتمدة.
            </Typography>

            <Typography sx={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              تقوم الإدارة حالياً بمراجعة ملائمة تفاصيل الطلب واعتماد تسعير الساعة وتحديد نسبة المحاضر المستحقة. بمجرد اكتمال الاعتماد الإداري، ستصلك إشعار فوري وستتمكن من البدء في تسجيل ورفع المحتوى المطلوب.
            </Typography>
          </Box>
        </Stack>

        {/* Left Side in RTL (Second child): Expected Time Card */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: '#FFFBEB',
            border: '1px solid #FEF3C7',
            textAlign: 'center',
            minWidth: { xs: '100%', md: 200 },
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: 12, color: '#92400E', fontWeight: 600, mb: 0.5 }}>
            الوقت المتوقع للاعتماد
          </Typography>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
            }}
          >
            <Iconify icon="solar:clock-circle-bold" width={18} />
            خلال 24 ساعة عمل
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
