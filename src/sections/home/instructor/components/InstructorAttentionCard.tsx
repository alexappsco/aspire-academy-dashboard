'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { InstructorAttentionData, InstructorAttentionItem } from '../types';

interface Props {
  data: InstructorAttentionData;
  onAction?: (actionType: InstructorAttentionItem['actionType']) => void;
}

export default function InstructorAttentionCard({ data, onAction }: Props) {
  const t = useTranslations('InstructorHome.attention');

  const getButtonStyles = (variant: InstructorAttentionItem['buttonVariant']) => {
    switch (variant) {
      case 'amber':
        return {
          bgcolor: '#F59E0B',
          color: '#FFFFFF',
          '&:hover': { bgcolor: '#D97706' },
        };
      case 'emerald':
        return {
          bgcolor: '#059669',
          color: '#FFFFFF',
          '&:hover': { bgcolor: '#047857' },
        };
      case 'subtle':
      default:
        return {
          bgcolor: '#F1F5F9',
          color: '#475569',
          '&:hover': { bgcolor: '#E2E8F0' },
        };
    }
  };

  return (
    <Card
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: '16px',
        bgcolor: '#FFFDF7',
        border: '1.5px solid #FEF08A',
        boxShadow: '0 2px 12px rgba(245, 158, 11, 0.04)',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#F59E0B',
            }}
          />
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1C252E' }}>
            {t('title')}
          </Typography>
        </Stack>

        <Box
          sx={{
            bgcolor: '#FEF3C7',
            color: '#B45309',
            px: 1.5,
            py: 0.5,
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {t('pending_tasks', { count: data.pendingTasksCount })}
        </Box>
      </Stack>

      {/* Sub-cards Grid */}
      <Grid container spacing={2}>
        {data.items.map((item) => {
          const btnStyles = getButtonStyles(item.buttonVariant);

          return (
            <Grid key={item.id} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${item.borderColor}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box>
                  {/* Badge */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 32,
                      height: 28,
                      px: 1,
                      borderRadius: '8px',
                      bgcolor: item.badgeBg,
                      color: item.badgeColor,
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      mb: 1.5,
                    }}
                  >
                    {item.count}
                  </Box>

                  {/* Title */}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: '#1C252E',
                      mb: 0.75,
                    }}
                  >
                    {item.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      color: '#64748B',
                      lineHeight: 1.6,
                      minHeight: 40,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>

                {/* Button */}
                <Button
                  fullWidth
                  onClick={() => onAction?.(item.actionType)}
                  sx={{
                    mt: 2,
                    py: 1,
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    boxShadow: 'none',
                    ...btnStyles,
                  }}
                >
                  {item.buttonText}
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
}
