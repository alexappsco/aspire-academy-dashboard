'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import MediaUploadBox from './MediaUploadBox';
import LearningObjectivesCard from './LearningObjectivesCard';
import type { CourseFormValues } from '../types';
import type { FacultyDto } from 'src/actions/faculties';
import type { SemesterDto } from 'src/actions/semesters';

interface BasicInfoStepProps {
  values: CourseFormValues;
  onChange: <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => void;
  errors?: Partial<Record<keyof CourseFormValues, string>>;
  universities: { id: string; nameAr: string; nameEn: string }[];
  faculties: FacultyDto[];
  filteredAcademicYears: { id: string; nameAr: string; nameEn: string }[];
  semesters: SemesterDto[];
  fields: { id: string; nameAr: string; nameEn: string }[];
  specializations: { id: string; nameAr: string; nameEn: string }[];
  instructors: { id: string; name: string }[];
  currencies: { id: string; name: string; symbol: string }[];
  studyMaterials: { id: string; nameAr: string; nameEn: string }[];
  loadingFaculties: boolean;
  loadingSemesters: boolean;
  loadingSpecializations: boolean;
  loadingStudyMaterials: boolean;
  imageRequired?: boolean;
}

const inputRootSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#FFFFFF',
    fontSize: '0.9375rem',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#1B8354' },
  },
};

function SelectLoadingIcon({
  loading,
  className,
  isRtl,
}: {
  loading: boolean;
  className?: string;
  isRtl: boolean;
}) {
  if (loading) return <CircularProgress size={18} sx={{ mr: 1, flexShrink: 0 }} />;
  return <span className={className} style={{ marginRight: isRtl ? 'auto' : 0 }} />;
}

const COURSE_TYPES = ['Full', 'MidTerm', 'Final'];

export default function BasicInfoStep({
  values,
  onChange,
  errors = {},
  universities,
  faculties,
  filteredAcademicYears,
  semesters,
  fields,
  specializations,
  instructors,
  currencies,
  studyMaterials,
  loadingFaculties,
  loadingSemesters,
  loadingSpecializations,
  loadingStudyMaterials,
  imageRequired = true,
}: BasicInfoStepProps) {
  const t = useTranslations('CreateCourse');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 2.5,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Iconify icon="solar:info-circle-bold" width={24} sx={{ color: '#1C252E' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}>
            {t('basic_info.card_title')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3.5, borderColor: '#F1F5F9' }} />

        <Stack spacing={3}>
          {/* Row 1: Title + Course Type */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.name_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                placeholder={t('basic_info.name_placeholder')}
                value={values.title}
                onChange={(e) => onChange('title', e.target.value)}
                error={!!errors.title}
                sx={inputRootSx}
              />
              {errors.title && <FormHelperText error>{errors.title}</FormHelperText>}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.type_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.type}
                onChange={(e) => onChange('type', e.target.value)}
                error={!!errors.type}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>{t('basic_info.type_placeholder')}</MenuItem>
                {COURSE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </SelectField>
              {errors.type && <FormHelperText error>{errors.type}</FormHelperText>}
            </Box>
          </Stack>

          {/* Row 2: Field + Specialization */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.field_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.fieldId}
                onChange={(e) => onChange('fieldId', e.target.value)}
                error={!!errors.fieldId}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>{t('basic_info.field_placeholder')}</MenuItem>
                {fields.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
              {errors.fieldId && <FormHelperText error>{errors.fieldId}</FormHelperText>}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.specialty_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.specializationId}
                onChange={(e) => onChange('specializationId', e.target.value)}
                disabled={!values.fieldId}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    IconComponent: (p) => <SelectLoadingIcon loading={loadingSpecializations} isRtl={isRtl} {...p} />,
                  },
                }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>
                  {loadingSpecializations ? t('basic_info.loading') : t('basic_info.specialty_placeholder')}
                </MenuItem>
                {specializations.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 3: Price + OldPrice */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.current_price_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder={t('basic_info.current_price_placeholder')}
                value={values.price}
                onChange={(e) => onChange('price', e.target.value)}
                error={!!errors.price}
                sx={inputRootSx}
              />
              {errors.price && <FormHelperText error>{errors.price}</FormHelperText>}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.old_price_label')}
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder={t('basic_info.old_price_placeholder')}
                value={values.oldPrice}
                onChange={(e) => onChange('oldPrice', e.target.value)}
                sx={inputRootSx}
              />
            </Box>
          </Stack>

          {/* Row 4: Currency + Access Duration */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.currency_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.currencyId}
                onChange={(e) => onChange('currencyId', e.target.value)}
                error={!!errors.currencyId}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>{t('basic_info.currency_placeholder')}</MenuItem>
                {currencies.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} {item.symbol ? `(${item.symbol})` : ''}
                  </MenuItem>
                ))}
              </SelectField>
              {errors.currencyId && <FormHelperText error>{errors.currencyId}</FormHelperText>}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.access_duration_label')}
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder={t('basic_info.access_duration_placeholder')}
                value={values.accessDurationInDays}
                onChange={(e) => onChange('accessDurationInDays', e.target.value)}
                slotProps={{ input: { endAdornment: <InputAdornment position="end">days</InputAdornment> } }}
                sx={inputRootSx}
              />
            </Box>
          </Stack>

          {/* Row 5: Instructor + University */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.lecturer_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.instructorId}
                onChange={(e) => onChange('instructorId', e.target.value)}
                error={!!errors.instructorId}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>{t('basic_info.lecturer_placeholder')}</MenuItem>
                {instructors.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                ))}
              </SelectField>
              {errors.instructorId && <FormHelperText error>{errors.instructorId}</FormHelperText>}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.university_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.universityId}
                onChange={(e) => onChange('universityId', e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>{t('basic_info.university_placeholder')}</MenuItem>
                {universities.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 6: College + Academic Year */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t('basic_info.college_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.facultyId}
                onChange={(e) => onChange('facultyId', e.target.value)}
                disabled={!values.universityId}
                error={!!errors.facultyId}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    IconComponent: (p) => <SelectLoadingIcon loading={loadingFaculties} isRtl={isRtl} {...p} />,
                  },
                }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>
                  {loadingFaculties ? t('basic_info.loading') : t('basic_info.college_placeholder')}
                </MenuItem>
                {faculties.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
              {errors.facultyId && <FormHelperText error>{errors.facultyId}</FormHelperText>}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.academic_year_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.academicYearId}
                onChange={(e) => onChange('academicYearId', e.target.value)}
                disabled={!values.facultyId || filteredAcademicYears.length === 0}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>{t('basic_info.academic_year_placeholder')}</MenuItem>
                {filteredAcademicYears.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 7: Semester + Study Material */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.semester_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.semesterId}
                onChange={(e) => onChange('semesterId', e.target.value)}
                disabled={!values.academicYearId || semesters.length === 0}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    IconComponent: (p) => <SelectLoadingIcon loading={loadingSemesters} isRtl={isRtl} {...p} />,
                  },
                }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>
                  {loadingSemesters ? t('basic_info.loading') : t('basic_info.semester_placeholder')}
                </MenuItem>
                {semesters.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1 }}>
                {t('basic_info.subject_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.studyMaterialId}
                onChange={(e) => onChange('studyMaterialId', e.target.value)}
                disabled={!values.facultyId || !values.semesterId}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    IconComponent: (p) => <SelectLoadingIcon loading={loadingStudyMaterials} isRtl={isRtl} {...p} />,
                  },
                }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled>
                  {loadingStudyMaterials ? t('basic_info.loading') : t('basic_info.subject_placeholder')}
                </MenuItem>
                {studyMaterials.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {isRtl ? item.nameAr : item.nameEn}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Description */}
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {t('basic_info.description_label')}
              <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={t('basic_info.description_placeholder')}
              value={values.description}
              onChange={(e) => onChange('description', e.target.value)}
              error={!!errors.description}
              sx={inputRootSx}
            />
            {errors.description && <FormHelperText error>{errors.description}</FormHelperText>}
          </Box>
        </Stack>
      </Card>

      <LearningObjectivesCard
        objectives={values.learningObjectives}
        onChange={(objs) => onChange('learningObjectives', objs)}
      />

      <Card
        sx={{
          borderRadius: 2.5,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Iconify icon="solar:videocamera-record-bold" width={24} sx={{ color: '#1C252E' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}>
            {t('media.card_title')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3.5, borderColor: '#F1F5F9' }} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <MediaUploadBox
            label={t('media.thumbnail_label')}
            recommendedSize={t('media.thumbnail_recommended')}
            iconName="solar:cloud-upload-bold"
            value={values.image}
            onChange={(file) => onChange('image', file)}
            required={imageRequired}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
