'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import CourseStepper from './components/CourseStepper';
import BasicInfoStep from './components/BasicInfoStep';
import ChaptersStep from './components/ChaptersStep';
import { CourseFormValues, Chapter } from './types';
import { INITIAL_CHAPTERS, INITIAL_OBJECTIVES } from './_mock';

const initialValues: CourseFormValues = {
  name: '',
  field: '',
  currentPrice: '',
  oldPrice: '',
  lecturer: '',
  college: '',
  subject: '',
  specialty: '',
  duration: '',
  courseType: '',
  description: '',
  learningObjectives: INITIAL_OBJECTIVES,
  thumbnail: null,
  cover: null,
  chapters: INITIAL_CHAPTERS,
};

export default function CreateCourseView() {
  const t = useTranslations('CreateCourse');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [activeStep, setActiveStep] = useState(1);
  const [formValues, setFormValues] = useState<CourseFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormValues, string>>>({});

  const handleFieldChange = <K extends keyof CourseFormValues>(
    field: K,
    value: CourseFormValues[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChaptersChange = (chapters: Chapter[]) => {
    setFormValues((prev) => ({ ...prev, chapters }));
  };

  const validateBasicInfo = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormValues, string>> = {};
    if (!formValues.name.trim()) newErrors.name = t('messages.validation_required');
    if (!formValues.currentPrice.trim()) newErrors.currentPrice = t('messages.validation_required');
    if (!formValues.oldPrice.trim()) newErrors.oldPrice = t('messages.validation_required');
    if (!formValues.lecturer) newErrors.lecturer = t('messages.validation_required');
    if (!formValues.college) newErrors.college = t('messages.validation_required');
    if (!formValues.subject) newErrors.subject = t('messages.validation_required');
    if (!formValues.duration.trim()) newErrors.duration = t('messages.validation_required');
    if (!formValues.description.trim()) newErrors.description = t('messages.validation_required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateBasicInfo()) {
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error(t('messages.validation_required'));
    }
  };

  const handleSaveDraft = () => {
    toast.success(t('messages.draft_saved'));
  };

  const handleCreateCourse = () => {
    if (!validateBasicInfo()) {
      setActiveStep(1);
      toast.error(t('messages.validation_required'));
      return;
    }
    toast.success(t('messages.course_created'));
    setTimeout(() => {
      router.push('/courses');
    }, 800);
  };

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      {/* 1. Header & Breadcrumbs */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3.5,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box>
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { mx: 1, color: '#94A3B8' } }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push('/courses')}
              sx={{ cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 500 }}
            >
              {t('breadcrumb_courses')}
            </Link>
            <Typography sx={{ fontSize: 13, color: '#1E293B', fontWeight: 600 }}>
              {t('breadcrumb_add')}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => router.push('/courses')}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            gap: 1,
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('breadcrumb_add')}
        </Button>
      </Stack>

      {/* 2. Step Indicator */}
      <CourseStepper
        activeStep={activeStep}
        onStepClick={(step) => {
          if (step === 1 || validateBasicInfo()) {
            setActiveStep(step);
          }
        }}
      />

      {/* 3. Step Content */}
      {activeStep === 1 ? (
        <BasicInfoStep
          values={formValues}
          onChange={handleFieldChange}
          errors={errors}
        />
      ) : (
        <ChaptersStep
          chapters={formValues.chapters}
          onChaptersChange={handleChaptersChange}
        />
      )}

      {/* 4. Bottom Action Bar */}
      <Card
        sx={{
          borderRadius: 2.5,
          p: 2.5,
          mt: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: 2,
        }}
      >
        {/* Cancel Button */}
        <Button
          variant="outlined"
          onClick={() => router.push('/courses')}
          startIcon={<Iconify icon="mingcute:close-line" width={18} />}
          sx={{
            borderColor: '#E2E8F0',
            color: '#1E293B',
            borderRadius: 1.5,
            px: 3,
            py: 1,
            fontWeight: 600,
            fontSize: 15,
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: '#CBD5E1',
              bgcolor: '#F8FAFC',
            },
          }}
        >
          {t('actions.cancel')}
        </Button>

        {/* Right Actions (Draft & Next/Submit) */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {/* Save as Draft */}
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            startIcon={<Iconify icon="solar:disk-bold" width={18} />}
            sx={{
              borderColor: '#E2E8F0',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              gap: 1,
              flex: { xs: 1, sm: 'none' },
              '&:hover': {
                borderColor: '#CBD5E1',
                bgcolor: '#F8FAFC',
              },
            }}
          >
            {t('actions.save_draft')}
          </Button>

          {/* Continue (Step 1) or Create Course (Step 2) */}
          {activeStep === 1 ? (
            <Button
              variant="contained"
              onClick={handleContinue}
              endIcon={
                <Iconify
                  icon={isRtl ? 'solar:arrow-left-linear' : 'solar:arrow-right-linear'}
                  width={18}
                />
              }
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 3.5,
                py: 1,
                fontWeight: 700,
                fontSize: 15,
                boxShadow: 'none',
                gap: 1,
                flex: { xs: 1, sm: 'none' },
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {t('actions.continue')}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleCreateCourse}
              startIcon={<Iconify icon="mingcute:add-line" width={18} />}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 3.5,
                py: 1,
                fontWeight: 700,
                fontSize: 15,
                boxShadow: 'none',
                gap: 1,
                flex: { xs: 1, sm: 'none' },
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {t('actions.create_course')}
            </Button>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
