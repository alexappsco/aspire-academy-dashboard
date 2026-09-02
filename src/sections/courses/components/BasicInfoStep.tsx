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

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import MediaUploadBox from './MediaUploadBox';
import LearningObjectivesCard from './LearningObjectivesCard';
import { CourseFormValues } from '../types';
import {
  MOCK_LECTURERS,
  MOCK_COLLEGES,
  MOCK_SUBJECTS,
  MOCK_SPECIALTIES,
  MOCK_FIELDS,
  MOCK_COURSE_TYPES,
} from '../_mock';

interface BasicInfoStepProps {
  values: CourseFormValues;
  onChange: <K extends keyof CourseFormValues>(field: K, value: CourseFormValues[K]) => void;
  errors?: Partial<Record<keyof CourseFormValues, string>>;
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

export default function BasicInfoStep({
  values,
  onChange,
  errors = {},
}: BasicInfoStepProps) {
  const t = useTranslations('CreateCourse');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Stack spacing={3}>
      {/* 1. Course Information Card */}
      <Card
        sx={{
          borderRadius: 2.5,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Iconify
            icon="solar:info-circle-bold"
            width={24}
            sx={{ color: '#1C252E' }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}
          >
            {t('basic_info.card_title')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3.5, borderColor: '#F1F5F9' }} />

        {/* Form Fields Grid */}
        <Stack spacing={3}>
          {/* Row 1: Course Name & Field */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            {/* Course Name */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.name_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                placeholder={t('basic_info.name_placeholder')}
                value={values.name}
                onChange={(e) => onChange('name', e.target.value)}
                error={!!errors.name}
                sx={inputRootSx}
              />
              {errors.name && (
                <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                  {errors.name}
                </FormHelperText>
              )}
            </Box>

            {/* Field */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                }}
              >
                {t('basic_info.field_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.field}
                onChange={(e) => onChange('field', e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled sx={{ color: '#94A3B8' }}>
                  {t('basic_info.field_placeholder')}
                </MenuItem>
                {MOCK_FIELDS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {isRtl ? item.label_ar : item.label_en}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 2: Current Price & Price Before Discount */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            {/* Current Price */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.current_price_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                placeholder={t('basic_info.current_price_placeholder')}
                value={values.currentPrice}
                onChange={(e) => onChange('currentPrice', e.target.value)}
                error={!!errors.currentPrice}
                sx={inputRootSx}
              />
              {errors.currentPrice && (
                <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                  {errors.currentPrice}
                </FormHelperText>
              )}
            </Box>

            {/* Price Before Discount */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.old_price_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                placeholder={t('basic_info.old_price_placeholder')}
                value={values.oldPrice}
                onChange={(e) => onChange('oldPrice', e.target.value)}
                error={!!errors.oldPrice}
                sx={inputRootSx}
              />
              {errors.oldPrice && (
                <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                  {errors.oldPrice}
                </FormHelperText>
              )}
            </Box>
          </Stack>

          {/* Row 3: Lecturer & College */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            {/* Lecturer */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.lecturer_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.lecturer}
                onChange={(e) => onChange('lecturer', e.target.value)}
                error={!!errors.lecturer}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled sx={{ color: '#94A3B8' }}>
                  {t('basic_info.lecturer_placeholder')}
                </MenuItem>
                {MOCK_LECTURERS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {isRtl ? item.label_ar : item.label_en}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>

            {/* College */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.college_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.college}
                onChange={(e) => onChange('college', e.target.value)}
                error={!!errors.college}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled sx={{ color: '#94A3B8' }}>
                  {t('basic_info.college_placeholder')}
                </MenuItem>
                {MOCK_COLLEGES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {isRtl ? item.label_ar : item.label_en}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 4: Subject & Specialty */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            {/* Subject */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.subject_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <SelectField
                fullWidth
                value={values.subject}
                onChange={(e) => onChange('subject', e.target.value)}
                error={!!errors.subject}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled sx={{ color: '#94A3B8' }}>
                  {t('basic_info.subject_placeholder')}
                </MenuItem>
                {MOCK_SUBJECTS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {isRtl ? item.label_ar : item.label_en}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>

            {/* Specialty */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                }}
              >
                {t('basic_info.specialty_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.specialty}
                onChange={(e) => onChange('specialty', e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled sx={{ color: '#94A3B8' }}>
                  {t('basic_info.specialty_placeholder')}
                </MenuItem>
                {MOCK_SPECIALTIES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {isRtl ? item.label_ar : item.label_en}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 5: Course Duration & Course Type */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
            {/* Course Duration */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {t('basic_info.duration_label')}
                <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                placeholder={t('basic_info.duration_placeholder')}
                value={values.duration}
                onChange={(e) => onChange('duration', e.target.value)}
                error={!!errors.duration}
                sx={inputRootSx}
              />
              {errors.duration && (
                <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                  {errors.duration}
                </FormHelperText>
              )}
            </Box>

            {/* Course Type */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1E293B',
                  mb: 1,
                }}
              >
                {t('basic_info.type_label')}
              </Typography>
              <SelectField
                fullWidth
                value={values.courseType}
                onChange={(e) => onChange('courseType', e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
                sx={inputRootSx}
              >
                <MenuItem value="" disabled sx={{ color: '#94A3B8' }}>
                  {t('basic_info.type_placeholder')}
                </MenuItem>
                {MOCK_COURSE_TYPES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {isRtl ? item.label_ar : item.label_en}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>
          </Stack>

          {/* Row 6: Course Description */}
          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
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
            {errors.description && (
              <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                {errors.description}
              </FormHelperText>
            )}
          </Box>
        </Stack>
      </Card>

      {/* 2. Learning Objectives Card */}
      <LearningObjectivesCard
        objectives={values.learningObjectives}
        onChange={(objs) => onChange('learningObjectives', objs)}
      />

      {/* 3. Course Media Card */}
      <Card
        sx={{
          borderRadius: 2.5,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Iconify
            icon="solar:videocamera-record-bold"
            width={24}
            sx={{ color: '#1C252E' }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}
          >
            {t('media.card_title')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3.5, borderColor: '#F1F5F9' }} />

        {/* Media Upload Area (2 Boxes) */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Thumbnail */}
          <MediaUploadBox
            label={t('media.thumbnail_label')}
            recommendedSize={t('media.thumbnail_recommended')}
            iconName="solar:cloud-upload-bold"
            value={values.thumbnail}
            onChange={(file) => onChange('thumbnail', file)}
            required
          />

          {/* Cover */}
          <MediaUploadBox
            label={t('media.cover_label')}
            recommendedSize={t('media.cover_recommended')}
            iconName="solar:gallery-bold"
            value={values.cover}
            onChange={(file) => onChange('cover', file)}
            required
          />
        </Stack>
      </Card>
    </Stack>
  );
}
