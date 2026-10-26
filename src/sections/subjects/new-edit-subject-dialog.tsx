'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { getFacultiesLookupAction } from 'src/actions/study-materials';
import { getAcademicYears, type AcademicYearDto } from 'src/actions/academic-years';
import { getSemesters } from 'src/actions/semesters';
import type {
  StudyMaterialDto,
  CreateStudyMaterialDto,
  FacultyLookupDto,
  SemesterLookupDto,
} from 'src/types/study-material';

const FALLBACK_FACULTIES: FacultyLookupDto[] = [
  { id: '1', nameAr: 'كلية الطب', nameEn: 'Faculty of Medicine' },
  { id: '2', nameAr: 'كلية الهندسة', nameEn: 'Faculty of Engineering' },
  { id: '3', nameAr: 'كلية الحاسب', nameEn: 'Faculty of Computer Science' },
  { id: '4', nameAr: 'كلية إدارة الأعمال', nameEn: 'Faculty of Business Administration' },
  { id: '5', nameAr: 'كلية الصيدلة', nameEn: 'Faculty of Pharmacy' },
  { id: '6', nameAr: 'كلية الحقوق', nameEn: 'Faculty of Law' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: StudyMaterialDto | null;
  onSave: (data: CreateStudyMaterialDto) => Promise<boolean>;
}

interface FormContentProps {
  initialData?: StudyMaterialDto | null;
  onClose: () => void;
  onSave: (data: CreateStudyMaterialDto) => Promise<boolean>;
  isRtl: boolean;
}

function FormContent({ initialData, onClose, onSave, isRtl }: FormContentProps) {
  const t = useTranslations('Subjects');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [facultyId, setFacultyId] = useState(initialData?.facultyId ?? '');
  const [academicYearId, setAcademicYearId] = useState(initialData?.academicYearId ?? '');
  const [semesterId, setSemesterId] = useState(initialData?.semesterId ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [faculties, setFaculties] = useState<FacultyLookupDto[]>(FALLBACK_FACULTIES);
  const [academicYears, setAcademicYears] = useState<AcademicYearDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterLookupDto[]>([]);

  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoadingFaculties(true);
      try {
        const facRes = await getFacultiesLookupAction();
        if (isMounted) {
          if (facRes.success && facRes.data && facRes.data.length > 0) {
            setFaculties(facRes.data);
          }
        }
      } catch {
        // use fallback list
      } finally {
        if (isMounted) setLoadingFaculties(false);
      }

      if (initialData?.facultyId) {
        setLoadingAcademicYears(true);
        try {
          const ayRes = await getAcademicYears({
            FacultyId: initialData.facultyId,
            IsActive: true,
            MaxResultCount: 1000,
          });

          if (!isMounted) return;

          const loadedYears = ayRes.success && ayRes.data?.items ? ayRes.data.items : [];
          setAcademicYears(loadedYears);

          // Find academic year ID
          let foundYearId = initialData.academicYearId || '';
          if (!foundYearId && initialData.semesterId && loadedYears.length > 0) {
            const matchedYear = loadedYears.find((y) =>
              y.semesters?.some((s) => s.id === initialData.semesterId)
            );
            if (matchedYear) {
              foundYearId = matchedYear.id;
            }
          }

          if (!foundYearId && initialData.semesterId) {
            const semResAll = await getSemesters({
              FacultyId: initialData.facultyId,
              IsActive: true,
              MaxResultCount: 1000,
            });
            if (semResAll.success && semResAll.data?.items) {
              const matchedSemester = semResAll.data.items.find(
                (s) => s.id === initialData.semesterId
              );
              if (matchedSemester?.academicYears?.length) {
                foundYearId = matchedSemester.academicYears[0].id;
              }
            }
          }

          if (foundYearId) {
            setAcademicYearId(foundYearId);
            setLoadingSemesters(true);
            const semRes = await getSemesters({
              FacultyId: initialData.facultyId,
              AcademicYearId: foundYearId,
              IsActive: true,
              MaxResultCount: 1000,
            });
            if (isMounted && semRes.success && semRes.data?.items) {
              setSemesters(semRes.data.items);
            }
          }
        } catch {
          // ignore
        } finally {
          if (isMounted) {
            setLoadingAcademicYears(false);
            setLoadingSemesters(false);
          }
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [initialData]);

  const handleFacultyChange = async (newFacultyId: string) => {
    setFacultyId(newFacultyId);
    setAcademicYearId('');
    setSemesterId('');
    setAcademicYears([]);
    setSemesters([]);
    if (errors.facultyId) setErrors((prev) => ({ ...prev, facultyId: '' }));
    if (errors.academicYearId) setErrors((prev) => ({ ...prev, academicYearId: '' }));
    if (errors.semesterId) setErrors((prev) => ({ ...prev, semesterId: '' }));

    if (!newFacultyId) return;

    setLoadingAcademicYears(true);
    try {
      const res = await getAcademicYears({
        FacultyId: newFacultyId,
        IsActive: true,
        MaxResultCount: 1000,
      });
      if (res.success && res.data?.items) {
        setAcademicYears(res.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const handleAcademicYearChange = async (newAcademicYearId: string) => {
    setAcademicYearId(newAcademicYearId);
    setSemesterId('');
    setSemesters([]);
    if (errors.academicYearId) setErrors((prev) => ({ ...prev, academicYearId: '' }));
    if (errors.semesterId) setErrors((prev) => ({ ...prev, semesterId: '' }));

    if (!newAcademicYearId || !facultyId) return;

    setLoadingSemesters(true);
    try {
      const res = await getSemesters({
        FacultyId: facultyId,
        AcademicYearId: newAcademicYearId,
        IsActive: true,
        MaxResultCount: 1000,
      });
      if (res.success && res.data?.items) {
        setSemesters(res.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoadingSemesters(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nameAr.trim()) {
      newErrors.nameAr = isRtl ? 'يرجى إدخال الاسم بالعربية' : 'Please enter Arabic name';
    }
    if (!nameEn.trim()) {
      newErrors.nameEn = isRtl ? 'يرجى إدخال الاسم بالإنجليزية' : 'Please enter English name';
    }
    if (!facultyId) {
      newErrors.facultyId = isRtl ? 'يرجى اختيار الكلية' : 'Please select college';
    }
    if (!academicYearId) {
      newErrors.academicYearId = isRtl ? 'يرجى اختيار السنة الدراسية' : 'Please select academic year';
    }
    if (!semesterId) {
      newErrors.semesterId = isRtl ? 'يرجى اختيار الفصل الدراسي' : 'Please select semester';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: CreateStudyMaterialDto = {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        facultyId,
        academicYearId,
        semesterId,
        isActive,
      };

      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '1.125rem',
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        <IconButton size="small" onClick={onClose} disabled={submitting}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, px: 3, pb: 3 }}>
        <Stack spacing={2.5}>
          {/* الاسم بالعربية */}
          <TextField
            fullWidth
            label={t('dialog.name_ar')}
            placeholder={t('dialog.name_ar_placeholder')}
            value={nameAr}
            onChange={(e) => {
              setNameAr(e.target.value);
              if (errors.nameAr) setErrors((prev) => ({ ...prev, nameAr: '' }));
            }}
            error={!!errors.nameAr}
            helperText={errors.nameAr}
            disabled={submitting}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              ...(isRtl && {
                '& .MuiOutlinedInput-input': { textAlign: 'right' },
              }),
            }}
          />

          {/* الاسم بالإنجليزية */}
          <TextField
            fullWidth
            label={t('dialog.name_en')}
            placeholder={t('dialog.name_en_placeholder')}
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (errors.nameEn) setErrors((prev) => ({ ...prev, nameEn: '' }));
            }}
            error={!!errors.nameEn}
            helperText={errors.nameEn}
            disabled={submitting}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          />

          {/* الكلية / Faculty */}
          <TextField
            select
            fullWidth
            label={t('dialog.college')}
            value={facultyId}
            onChange={(e) => handleFacultyChange(e.target.value)}
            error={!!errors.facultyId}
            helperText={errors.facultyId}
            disabled={submitting || loadingFaculties}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          >
            {loadingFaculties ? (
              <MenuItem disabled>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
              </MenuItem>
            ) : faculties.length === 0 ? (
              <MenuItem disabled>{isRtl ? 'لا توجد كليات' : 'No faculties'}</MenuItem>
            ) : (
              faculties.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {isRtl ? f.nameAr || f.name : f.nameEn || f.name}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* السنة الدراسية / Academic Year */}
          <TextField
            select
            fullWidth
            label={t('dialog.academic_year')}
            value={academicYearId}
            onChange={(e) => handleAcademicYearChange(e.target.value)}
            error={!!errors.academicYearId}
            helperText={
              errors.academicYearId ||
              (!facultyId ? (isRtl ? 'يرجى اختيار الكلية أولاً' : 'Please select a college first') : '')
            }
            disabled={submitting || !facultyId || loadingAcademicYears}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          >
            {loadingAcademicYears ? (
              <MenuItem disabled>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
              </MenuItem>
            ) : academicYears.length === 0 ? (
              <MenuItem disabled>
                {isRtl ? 'لا توجد سنوات دراسية متاحة' : 'No academic years available'}
              </MenuItem>
            ) : (
              academicYears.map((ay) => (
                <MenuItem key={ay.id} value={ay.id}>
                  {isRtl ? ay.nameAr || ay.nameEn : ay.nameEn || ay.nameAr}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* الفصل الدراسي / Semester */}
          <TextField
            select
            fullWidth
            label={t('dialog.semester')}
            value={semesterId}
            onChange={(e) => {
              setSemesterId(e.target.value);
              if (errors.semesterId) setErrors((prev) => ({ ...prev, semesterId: '' }));
            }}
            error={!!errors.semesterId}
            helperText={
              errors.semesterId ||
              (!academicYearId
                ? isRtl
                  ? 'يرجى اختيار السنة الدراسية أولاً'
                  : 'Please select an academic year first'
                : '')
            }
            disabled={submitting || !academicYearId || loadingSemesters}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          >
            {loadingSemesters ? (
              <MenuItem disabled>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                {isRtl ? 'جارٍ التحميل...' : 'Loading...'}
              </MenuItem>
            ) : semesters.length === 0 ? (
              <MenuItem disabled>
                {isRtl ? 'لا توجد فصول دراسية متاحة' : 'No semesters available'}
              </MenuItem>
            ) : (
              semesters.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {isRtl ? s.nameAr || s.nameEn || s.name : s.nameEn || s.nameAr || s.name}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* مفعل / غير مفعل */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('dialog.status')}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="success"
                  disabled={submitting}
                />
              }
              label={isActive ? t('status.active') : t('status.inactive')}
              sx={{ m: 0 }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={submitting}
          sx={{ borderRadius: 1.5, borderColor: '#E2E8F0', color: '#1E293B' }}
        >
          {t('dialog.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{
            borderRadius: 1.5,
            bgcolor: '#1C252E',
            '&:hover': { bgcolor: '#2C353E' },
            px: 3,
          }}
        >
          {t('dialog.save')}
        </Button>
      </DialogActions>
    </>
  );
}

export default function SubjectFormDialog({
  open,
  onClose,
  initialData,
  onSave,
}: Props) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      {open && (
        <FormContent
          initialData={initialData}
          onClose={onClose}
          onSave={onSave}
          isRtl={isRtl}
        />
      )}
    </Dialog>
  );
}
