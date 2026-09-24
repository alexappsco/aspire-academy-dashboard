'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { useCourseForm } from './use-course-form';
import CourseStepper from './components/CourseStepper';
import BasicInfoStep from './components/BasicInfoStep';
import ChaptersStep from './components/ChaptersStep';

export default function CreateCourseView() {
  const t = useTranslations('CreateCourse');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();

  const {
    activeStep,
    formValues,
    errors,
    isSubmitting,
    isInstructor,
    isAdmin,
    universities,
    fields,
    instructors,
    currencies,
    faculties,
    specializations,
    semesters,
    studyMaterials,
    filteredAcademicYears,
    loadingFaculties,
    loadingSpecializations,
    loadingSemesters,
    loadingStudyMaterials,
    handleFieldChange,
    handleChaptersChange,
    handleStepClick,
    handleContinue,
    handleSubmit,
    handleSaveDraft,
  } = useCourseForm();

  return (
    <Box sx={{ py: 2, pb: 6 }}>
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
      </Stack>

      <CourseStepper activeStep={activeStep} onStepClick={handleStepClick} />

      {activeStep === 1 ? (
        <BasicInfoStep
          values={formValues}
          onChange={handleFieldChange}
          errors={errors}
          universities={universities}
          faculties={faculties}
          filteredAcademicYears={filteredAcademicYears}
          semesters={semesters}
          loadingSemesters={loadingSemesters}
          fields={fields}
          specializations={specializations}
          instructors={instructors}
          currencies={currencies}
          studyMaterials={studyMaterials}
          loadingFaculties={loadingFaculties}
          loadingSpecializations={loadingSpecializations}
          loadingStudyMaterials={loadingStudyMaterials}
          hideInstructor={isInstructor}
          showPlatformPercentage={isAdmin}
          hidePricing={isInstructor}
        />
      ) : (
        <ChaptersStep
          chapters={formValues.chapters}
          onChaptersChange={handleChaptersChange}
        />
      )}

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
        <Button
          variant="outlined"
          onClick={() => router.push('/courses')}
          sx={{
            borderColor: '#E2E8F0',
            color: '#1E293B',
            borderRadius: 1.5,
            px: 3,
            py: 1,
            fontWeight: 600,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
          <span>{t('actions.cancel')}</span>
        </Button>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            sx={{
              borderColor: '#E2E8F0',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: { xs: 1, sm: 'none' },
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            <Iconify icon="solar:disk-bold" width={18} />
            <span>{t('actions.save_draft')}</span>
          </Button>

          {activeStep === 1 ? (
            <Button
              variant="contained"
              onClick={handleContinue}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 3.5,
                py: 1,
                fontWeight: 700,
                fontSize: 15,
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: { xs: 1, sm: 'none' },
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              <span>{t('actions.continue')}</span>
              <Iconify
                icon={isRtl ? 'solar:arrow-left-linear' : 'solar:arrow-right-linear'}
                width={18}
              />
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 3.5,
                py: 1,
                fontWeight: 700,
                fontSize: 15,
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: { xs: 1, sm: 'none' },
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
              ) : (
                <Iconify icon="mingcute:add-line" width={18} />
              )}
              <span>{t('actions.create_course')}</span>
            </Button>
          )}
        </Stack>
      </Card>
    </Box>
  );
}