'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Iconify from 'src/components/iconify';

interface Props {
  student?: {
    studentId?: string;
    name?: string | null;
    imageUrl?: string | null;
    countryName?: string | null;
    email?: string | null;
  } | null;
  specializationName?: string | null;
  showContactInfo?: boolean;
}

export default function StudentInfoCard({
  student,
  specializationName,
  showContactInfo = false,
}: Props) {
  const studentName = student?.name || 'طالب غير محدد';
  const studentAvatar = student?.imageUrl || undefined;
  const country = student?.countryName || 'غير محدد';

  return (
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
      }}
    >
      {/* Title */}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5, gap: 1 }}>
        <Iconify icon="solar:user-id-bold" width={20} sx={{ color: '#0D9488' }} />
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
          بيانات الطالب
        </Typography>
      </Stack>

      {/* Student Profile Row */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: '#F8FAFC',
          border: '1px solid #F1F5F9',
          mb: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src={studentAvatar}
          alt={studentName}
          sx={{
            width: 54,
            height: 54,
            border: '2px solid #E2E8F0',
            bgcolor: '#E2E8F0',
            color: '#475569',
            fontWeight: 700,
          }}
        >
          {(studentName[0] || 'S').toUpperCase()}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
            {studentName}
          </Typography>
          {specializationName && (
            <Typography sx={{ fontSize: 12.5, color: '#64748B', mt: 0.25 }}>
              {specializationName}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Key-Value Details based on actual backend response */}
      <Stack spacing={1.5}>
        <Box
          sx={{
            p: 1.5,
            px: 2,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
            الدولة:
          </Typography>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
            {country}
          </Typography>
        </Box>

        {specializationName && (
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              التخصص الأكاديمي:
            </Typography>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0284C7' }}>
              {specializationName}
            </Typography>
          </Box>
        )}

        {/* Email is displayed if available and request is active */}
        {showContactInfo && student?.email && (
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              البريد الإلكتروني:
            </Typography>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#2563EB', direction: 'ltr' }}>
              {student.email}
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
