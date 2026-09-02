'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';
import { ReviewItem } from '../types';

interface RecentReviewsCardProps {
  reviews: ReviewItem[];
  onViewAll?: () => void;
}

export default function RecentReviewsCard({
  reviews,
  onViewAll,
}: RecentReviewsCardProps) {
  const t = useTranslations('CourseDetails.recent_reviews');

  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: '#1E293B', mb: 2, fontSize: 17 }}
      >
        {t('title')}
      </Typography>

      <Stack spacing={2} sx={{ mb: 2.5 }}>
        {reviews.map((rev, index) => (
          <Box key={rev.id}>
            {/* Header: Name & Stars on left/right */}
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Stack direction="row" spacing={0.3}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Iconify
                    key={i}
                    icon="solar:star-bold"
                    width={14}
                    sx={{ color: '#F59E0B' }}
                  />
                ))}
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1E293B' }}>
                  {rev.name}
                </Typography>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: '#E0F2FE',
                    color: '#0284C7',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {rev.name.charAt(0)}
                </Avatar>
              </Stack>
            </Stack>

            {/* Comment */}
            <Typography
              sx={{
                fontSize: 12.5,
                color: '#64748B',
                lineHeight: 1.6,
                textAlign: 'right',
              }}
            >
              &ldquo;{rev.comment}&rdquo;
            </Typography>

            {index < reviews.length - 1 && (
              <Divider sx={{ mt: 2, borderColor: '#F1F5F9' }} />
            )}
          </Box>
        ))}
      </Stack>

      <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Link
          component="button"
          onClick={onViewAll}
          underline="hover"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: '#0284C7',
            cursor: 'pointer',
          }}
        >
          {t('view_all')}
        </Link>
      </Box>
    </Card>
  );
}
