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
import { getFacultiesLookupAction, getSemestersLookupAction } from 'src/actions/study-materials';
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

const FALLBACK_SEMESTERS: SemesterLookupDto[] = [
  { id: '1', nameAr: 'الفصل الدراسي الأول', nameEn: 'First Semester' },
  { id: '2', nameAr: 'الفصل الدراسي الثاني', nameEn: 'Second Semester' },
  { id: '3', nameAr: 'الفصل الدراسي الصيفي', nameEn: 'Summer Semester' },
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
  const [semesterId, setSemesterId] = useState(initialData?.semesterId ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [faculties, setFaculties] = useState<FacultyLookupDto[]>(FALLBACK_FACULTIES);
  const [semesters, setSemesters] = useState<SemesterLookupDto[]>(FALLBACK_SEMESTERS);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchLookups = async () => {
      try {
        const [facultiesRes, semestersRes] = await Promise.all([
          getFacultiesLookupAction(),
          getSemestersLookupAction(),
        ]);

        if (isMounted) {
          if (facultiesRes.success && facultiesRes.data && facultiesRes.data.length > 0) {
            setFaculties(facultiesRes.data);
          }
          if (semestersRes.success && semestersRes.data && semestersRes.data.length > 0) {
            setSemesters(semestersRes.data);
          }
        }
      } catch {
        // use fallback list
      }
    };

    fetchLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nameAr.trim()) {
      newErrors.nameAr = 'يرجى إدخال الاسم بالعربية';
    }
    if (!nameEn.trim()) {
      newErrors.nameEn = 'يرجى إدخال الاسم بالإنجليزية';
    }
    if (!facultyId) {
      newErrors.facultyId = 'يرجى اختيار الكلية';
    }
    if (!semesterId) {
      newErrors.semesterId = 'يرجى اختيار الفصل الدراسي';
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
            onChange={(e) => {
              setFacultyId(e.target.value);
              if (errors.facultyId) setErrors((prev) => ({ ...prev, facultyId: '' }));
            }}
            error={!!errors.facultyId}
            helperText={errors.facultyId}
            disabled={submitting}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          >
            {faculties.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {isRtl ? f.nameAr || f.name : f.nameEn || f.name}
              </MenuItem>
            ))}
          </TextField>

          {/* الفصل الدراسي / Semester */}
          <TextField
            select
            fullWidth
            label={isRtl ? 'الفصل الدراسي' : 'Semester'}
            value={semesterId}
            onChange={(e) => {
              setSemesterId(e.target.value);
              if (errors.semesterId) setErrors((prev) => ({ ...prev, semesterId: '' }));
            }}
            error={!!errors.semesterId}
            helperText={errors.semesterId}
            disabled={submitting}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          >
            {semesters.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {isRtl ? s.nameAr || s.name : s.nameEn || s.name}
              </MenuItem>
            ))}
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
          {isEdit ? t('dialog.save') : t('dialog.save')}
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
