'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Iconify from 'src/components/iconify';
import { StudentAcademicInfo } from 'src/types/private-request';

interface Props {
  student?: {
    id?: string;
    studentId?: string;
    name?: string | null;
    avatar?: string;
    imageUrl?: string | null;
    country?: string;
    countryName?: string | null;
    university?: string;
    college?: string;
    phone?: string;
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
  const studentAvatar = student?.imageUrl || student?.avatar || undefined;
  const country = student?.countryName || student?.country || 'غير محدد';
  const university = student?.university;
  const collegeOrSpec = student?.college || specializationName || 'غير محدد';

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
          بيانات الطالب الأكاديمية
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
          sx={{ width: 54, height: 54, border: '2px solid #E2E8F0', bgcolor: '#E2E8F0', color: '#475569' }}
        >
          {(studentName[0] || 'S').toUpperCase()}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
            {studentName}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#64748B', mt: 0.25 }}>
            {university ? `${university} - ` : ''}{collegeOrSpec}
          </Typography>
        </Box>
      </Box>

      {/* Key-Value Details: Value on RIGHT (First in RTL), Label on LEFT (Second in RTL) */}
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
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
            {country}
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
            الدولة:
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
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0284C7' }}>
              {specializationName}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              التخصص الأكاديمي:
            </Typography>
          </Box>
        )}

        {university && (
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
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              {university}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              الجامعة:
            </Typography>
          </Box>
        )}

        {student?.college && (
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
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              {student.college}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              الكلية:
            </Typography>
          </Box>
        )}

        {/* Contact information (Visible in active requests) */}
        {showContactInfo && student?.phone && (
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
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', direction: 'ltr' }}>
              {student.phone}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              رقم الهاتف:
            </Typography>
          </Box>
        )}

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
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#2563EB', direction: 'ltr' }}>
              {student.email}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              البريد الإلكتروني:
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
