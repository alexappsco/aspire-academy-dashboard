'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Iconify from 'src/components/iconify';
import type { UpcomingLessonItem } from '../types';

interface Props {
  lessons: UpcomingLessonItem[];
  onViewAll?: () => void;
  onJoinLesson?: (lesson: UpcomingLessonItem) => void;
  onViewDetails?: (lesson: UpcomingLessonItem) => void;
}

export default function UpcomingLessonsSection({
  lessons,
  onViewAll,
  onJoinLesson,
  onViewDetails,
}: Props) {
  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)',
        bgcolor: '#FFFFFF',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          mb: 2.5,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1C252E', fontSize: '1.1rem' }}>
            الدروس القادمة عبر الإنترنت
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem', mt: 0.25 }}>
            جلسات فردية مباشرة (1-on-1) محجوزة من قبل الطلاب عبر التطبيق
          </Typography>
        </Box>

        <Button
          onClick={onViewAll}
          endIcon={<Iconify icon="solar:arrow-left-linear" width={16} />}
          sx={{
            color: '#2563EB',
            fontWeight: 700,
            fontSize: '0.875rem',
            p: 0,
            minWidth: 'auto',
            gap: 0.75,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          عرض كافة الدروس
        </Button>
      </Stack>

      {/* Table Container */}
      <TableContainer sx={{ flex: 1, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '1px solid #F1F5F9', color: '#94A3B8', fontWeight: 600, fontSize: '0.8rem', py: 1.5 } }}>
              <TableCell align="right">الطالب</TableCell>
              <TableCell align="center">المادة</TableCell>
              <TableCell align="center">التاريخ والوقت</TableCell>
              <TableCell align="center">المدة</TableCell>
              <TableCell align="center">الحالة</TableCell>
              <TableCell align="center">الإجراء</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map((lesson, idx) => (
              <TableRow
                key={lesson.id}
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                  '& td': { py: 1.75, borderBottom: '1px solid #F8FAFC' },
                }}
              >
                {/* Student */}
                <TableCell align="right">
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: lesson.avatarColor || '#EFF6FF',
                        color: idx % 2 === 0 ? '#2563EB' : '#9333EA',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {lesson.avatarInitials}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1C252E' }}>
                        {lesson.studentName}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {lesson.studentGrade}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                {/* Subject */}
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C252E' }}>
                    {lesson.subject}
                  </Typography>
                </TableCell>

                {/* Date and Time */}
                <TableCell align="center">
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1C252E' }}>
                      {lesson.dateTime}
                    </Typography>
                    {lesson.timeNote && (
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: lesson.canJoin ? '#2563EB' : '#64748B',
                          mt: 0.25,
                        }}
                      >
                        {lesson.timeNote}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Duration */}
                <TableCell align="center">
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                    {lesson.duration}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={lesson.statusText}
                    icon={
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#118D57',
                          mr: 0.5,
                        }}
                      />
                    }
                    sx={{
                      bgcolor: '#D2F9E5',
                      color: '#118D57',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      px: 0.5,
                    }}
                  />
                </TableCell>

                {/* Action */}
                <TableCell align="center">
                  {lesson.canJoin ? (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onJoinLesson?.(lesson)}
                      startIcon={<Iconify icon="solar:videocamera-record-bold" width={16} />}
                      sx={{
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        py: 0.75,
                        px: 1.5,
                        gap: 0.75,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      انضم للدرس
                    </Button>
                  ) : (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => onViewDetails?.(lesson)}
                      sx={{
                        color: '#64748B',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        borderRadius: '8px',
                        py: 0.75,
                        px: 1.5,
                        '&:hover': { bgcolor: '#F1F5F9', color: '#1C252E' },
                      }}
                    >
                      عرض التفاصيل
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer Note */}
      <Box
        sx={{
          borderTop: '1px solid #F1F5F9',
          pt: 2,
          mt: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Iconify icon="solar:info-circle-bold" width={18} sx={{ color: '#2563EB', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
            تفتح غرفة الجلسة المباشرة قبل 10 دقائق من موعد الدرس المحدد.
          </Typography>
        </Stack>

        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1C252E' }}>
          3 دروس مجدولة لهذا اليوم
        </Typography>
      </Box>
    </Card>
  );
}
