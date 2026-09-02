'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';
import { CourseDetailsData } from '../types';

interface ContentSummaryCardProps {
  course: CourseDetailsData;
  onManageContent?: () => void;
}

export default function ContentSummaryCard({
  course,
  onManageContent,
}: ContentSummaryCardProps) {
  const t = useTranslations('CourseDetails.content_summary');

  const items = [
    {
      label: t('chapters'),
      value: course.chaptersCount,
      icon: 'solar:folder-bold',
    },
    {
      label: t('video_lessons'),
      value: course.videosCount,
      icon: 'solar:videocamera-record-bold',
    },
    {
      label: t('quizzes'),
      value: course.quizzesCount,
      icon: 'solar:document-text-bold',
    },
    {
      label: t('resources'),
      value: course.resourcesCount,
      icon: 'solar:file-text-bold',
    },
  ];

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        mb: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: '#1E293B', mb: 2, fontSize: 17 }}
      >
        {t('title')}
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {items.map((item, index) => (
          <Box key={item.label}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.8 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1E293B' }}>
                {item.value}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>
                  {item.label}
                </Typography>
                <Iconify icon={item.icon} width={18} sx={{ color: '#64748B' }} />
              </Box>
            </Stack>
            {index < items.length - 1 && (
              <Divider sx={{ borderColor: '#F1F5F9' }} />
            )}
          </Box>
        ))}
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        onClick={onManageContent}
        sx={{
          borderColor: '#0284C7',
          color: '#0284C7',
          borderRadius: 1.5,
          py: 1,
          fontWeight: 600,
          fontSize: 14,
          '&:hover': {
            borderColor: '#0369A1',
            bgcolor: '#F0F9FF',
          },
        }}
      >
        {t('manage_content')}
      </Button>
    </Card>
  );
}
