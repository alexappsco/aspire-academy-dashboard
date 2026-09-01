'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface CourseStepperProps {
  activeStep: number;
  onStepClick?: (step: number) => void;
}

export default function CourseStepper({ activeStep, onStepClick }: CourseStepperProps) {
  const t = useTranslations('CreateCourse.stepper');

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        p: { xs: 2, sm: 3 },
        mb: 3,
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 600,
          mx: 'auto',
          position: 'relative',
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* Step 1: Basic Info */}
        <Box
          onClick={() => onStepClick?.(1)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 2,
            minWidth: 100,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
              mb: 1,
              transition: 'all 0.2s ease',
            }}
          >
            1
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1C252E',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {t('basic_info')}
          </Typography>
        </Box>

        {/* Progress Line */}
        <Box
          sx={{
            flex: 1,
            height: 3,
            bgcolor: activeStep >= 2 ? '#1C252E' : '#E2E8F0',
            mx: 2,
            mb: 3, // Aligns line with the center of the step circles
            borderRadius: 2,
            transition: 'background-color 0.3s ease',
          }}
        />

        {/* Step 2: Add Chapters */}
        <Box
          onClick={() => onStepClick?.(2)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 2,
            minWidth: 100,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: activeStep >= 2 ? '#1C252E' : '#E2E8F0',
              color: activeStep >= 2 ? '#FFFFFF' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 15,
              mb: 1,
              transition: 'all 0.2s ease',
            }}
          >
            2
          </Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: activeStep >= 2 ? 700 : 500,
              color: activeStep >= 2 ? '#1C252E' : '#94A3B8',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {t('add_chapters')}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
