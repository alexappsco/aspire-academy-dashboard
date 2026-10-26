'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { getUniversitiesAction } from 'src/actions/unversity';
import { getAcademicYears, AcademicYearDto } from 'src/actions/academic-years';
import type { Faculty } from 'src/types/faculty';
import type { UniversityDto } from 'src/sections/university/types';

interface CollegeFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: Faculty | null;
  onSave: (formData: FormData) => Promise<boolean>;
}

export default function CollegeFormDialog({
  open,
  onClose,
  initialData,
  onSave,
}: CollegeFormDialogProps) {
  const t = useTranslations('Colleges');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [universityId, setUniversityId] = useState(initialData?.universityId ?? '');
  const [academicYearIds, setAcademicYearIds] = useState<string[]>(
    initialData?.academicYears?.map((y) => y.id) ?? []
  );
  const [active, setActive] = useState(initialData?.isActive ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl ?? null);

  const initialYearsMap = useMemo(() => {
    const map = new Map<string, string>();
    initialData?.academicYears?.forEach((y) => {
      map.set(y.id, y.name);
    });
    return map;
  }, [initialData]);

  const [universities, setUniversities] = useState<UniversityDto[]>(() => {
    if (initialData?.university) {
      return [
        {
          id: initialData.university.id,
          nameAr: initialData.university.name,
          nameEn: initialData.university.name,
          imageUrl: null,
          countryId: '',
          country: { id: '', name: '', code: null, currencyId: '', currency: null },
          order: 0,
          isActive: true,
        },
      ];
    }
    return [];
  });

  const [academicYears, setAcademicYears] = useState<AcademicYearDto[]>(() => {
    if (initialData?.academicYears?.length) {
      return initialData.academicYears.map((y) => ({
        id: y.id,
        nameAr: y.name,
        nameEn: y.name,
        order: 0,
        faculties: [],
        semesters: [],
        isActive: true,
      }));
    }
    return [];
  });
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  // Load universities and academic years
  useEffect(() => {
    let isMounted = true;
    const fetchLookups = async () => {
      setLoadingLookups(true);
      try {
        const [uniRes, yearsRes] = await Promise.all([
          getUniversitiesAction({ MaxResultCount: 1000 }),
          getAcademicYears({ MaxResultCount: 1000 }),
        ]);

        if (isMounted) {
          if (uniRes.success && uniRes.data?.items) {
            setUniversities(uniRes.data.items);
          }
          if (yearsRes.success && yearsRes.data?.items) {
            setAcademicYears(yearsRes.data.items);
          }
        }
      } catch (err) {
        console.error('Failed to load lookups', err);
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    };

    if (open) {
      fetchLookups();
    }

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!nameAr.trim() || !nameEn.trim() || !universityId) {
      return;
    }

    const formData = new FormData();
    formData.append('NameAr', nameAr.trim());
    formData.append('NameEn', nameEn.trim());
    formData.append('UniversityId', universityId);
    formData.append('IsActive', String(active));

    if (selectedFile) {
      formData.append('Image', selectedFile);
    }

    academicYearIds.forEach((id) => {
      formData.append('AcademicYearIds', id);
    });

    setIsSubmitting(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { borderRadius: 3, p: 1 } },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, fontWeight: 500 }}>
          {t('dialog.subtitle')}
        </Typography>

        {/* File Upload / Image Preview */}
        <Box
          component="label"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2.5,
            bgcolor: '#F8FAFC',
            border: '1.5px dashed #CBD5E1',
            borderRadius: 2,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
          }}
        >
          <input
            type="file"
            hidden
            accept="image/*"
            disabled={isSubmitting}
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  objectFit: 'contain',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#FFFFFF',
                  p: 0.5,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/course.svg';
                }}
              />
              <Typography variant="caption" sx={{ color: '#00A76F', fontWeight: 600 }}>
                {selectedFile ? selectedFile.name : t('dialog.change_image')}
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: '#E6F4EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <Iconify icon="eva:folder-open-outline" sx={{ fontSize: 28, color: '#00A76F' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                {t('dialog.select_image')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                {t('dialog.drag_drop')}{' '}
                <span style={{ color: '#00A76F', textDecoration: 'underline' }}>
                  {t('dialog.browse')}
                </span>
              </Typography>
            </>
          )}
        </Box>

        {/* University Select */}
        <Box sx={{ mb: 2 }}>
          <SelectField
            fullWidth
            size="small"
            label={t('dialog.university')}
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            disabled={loadingLookups || isSubmitting}
            error={touched && !universityId}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
            }}
          >
            <MenuItem value="" disabled>
              <em>{loadingLookups ? '...' : t('dialog.university_placeholder')}</em>
            </MenuItem>
            {universities.map((uni) => (
              <MenuItem key={uni.id} value={uni.id}>
                {isRtl ? uni.nameAr : uni.nameEn}
              </MenuItem>
            ))}
          </SelectField>
          {touched && !universityId && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {t('messages.validation_error')}
            </Typography>
          )}
        </Box>

        {/* Name Fields */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label={t('dialog.name_ar')}
            placeholder={t('dialog.name_ar_placeholder')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            error={touched && !nameAr.trim()}
            helperText={touched && !nameAr.trim() ? t('messages.validation_error') : ''}
            disabled={isSubmitting}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
            }}
          />
          <TextField
            fullWidth
            size="small"
            label={t('dialog.name_en')}
            placeholder={t('dialog.name_en_placeholder')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            error={touched && !nameEn.trim()}
            helperText={touched && !nameEn.trim() ? t('messages.validation_error') : ''}
            disabled={isSubmitting}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
            }}
          />
        </Box>

        {/* Academic Years Multi-select */}
        <Box sx={{ mb: 2.5 }}>
          <SelectField
            fullWidth
            size="small"
            label={t('dialog.academic_years')}
            value={academicYearIds}
            onChange={(e) => {
              const val = e.target.value;
              setAcademicYearIds(typeof val === 'string' ? val.split(',') : (val as string[]));
            }}
            disabled={loadingLookups || isSubmitting}
            slotProps={{
              inputLabel: { shrink: true },
              select: {
                multiple: true,
                renderValue: (selected: unknown) => {
                  const ids = ((selected as string[]) ?? []).filter(Boolean);
                  if (ids.length === 0) {
                    return <em>{t('dialog.academic_years_placeholder')}</em>;
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {ids.map((id) => {
                        const year = academicYears.find((y) => y.id === id);
                        const name = year
                          ? (isRtl ? year.nameAr : year.nameEn) || year.nameAr || year.nameEn
                          : initialYearsMap.get(id);

                        const displayLabel = name || (loadingLookups ? '...' : '');
                        if (!displayLabel) return null;

                        return (
                          <Chip
                            key={id}
                            size="small"
                            label={displayLabel}
                            sx={{ borderRadius: 1.5 }}
                          />
                        );
                      })}
                    </Box>
                  );
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
            }}
          >
            {academicYears.map((year) => (
              <MenuItem key={year.id} value={year.id}>
                <Checkbox checked={academicYearIds.includes(year.id)} size="small" />
                <ListItemText primary={isRtl ? year.nameAr : year.nameEn} />
              </MenuItem>
            ))}
          </SelectField>
        </Box>

        {/* Status Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {t('dialog.status')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isSubmitting}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, color: active ? '#1E293B' : '#94A3B8' }}>
              {active ? t('status.active') : t('status.inactive')}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': { bgcolor: '#0F172A' },
            }}
          >
            {isSubmitting ? t('dialog.saving') : t('dialog.save')}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              borderColor: '#CBD5E1',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
            }}
          >
            {t('dialog.cancel')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
