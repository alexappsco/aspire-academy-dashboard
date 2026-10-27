'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import type {
  InstructorSubjectItem,
  InstructorSubjectFormValues,
} from 'src/types/instructor-subject';
import {
  MOCK_COLLEGES,
  MOCK_SEMESTERS,
  MOCK_SUBJECT_CHOICES,
} from './mock-data';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (values: InstructorSubjectFormValues) => void;
  initialData?: InstructorSubjectItem | null;
}

export default function NewEditSubjectDialog({
  open,
  onClose,
  onSave,
  initialData,
}: Props) {
  const t = useTranslations('InstructorSubjects');
  const isEdit = Boolean(initialData);

  const [college, setCollege] = useState(MOCK_COLLEGES[0]?.label || '');
  const [semester, setSemester] = useState(MOCK_SEMESTERS[0]?.label || '');
  const [name, setName] = useState(MOCK_SUBJECT_CHOICES[0]?.label || '');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setCollege(initialData.college);
      setSemester(initialData.semester);
      setName(initialData.name);
      setIsActive(initialData.isActive);
    } else {
      setCollege(MOCK_COLLEGES[0]?.label || '');
      setSemester(MOCK_SEMESTERS[0]?.label || '');
      setName(MOCK_SUBJECT_CHOICES[0]?.label || '');
      setIsActive(true);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!college || !semester || !name) return;
    onSave({
      college,
      semester,
      name,
      isActive,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
          },
        },
      }}
    >
      {/* Top Close Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 0.5 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <Iconify icon="ic:round-close" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1E293B', mb: 3 }}
        >
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>

        {/* 1. College Select */}
        <SelectField
          fullWidth
          size="small"
          label={t('dialog.college_label')}
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#94A3B8' },
            },
          }}
        >
          {MOCK_COLLEGES.map((c) => (
            <MenuItem key={c.id} value={c.label}>
              {c.label}
            </MenuItem>
          ))}
        </SelectField>

        {/* 2. Semester Select */}
        <SelectField
          fullWidth
          size="small"
          label={t('dialog.semester_label')}
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#94A3B8' },
            },
          }}
        >
          {MOCK_SEMESTERS.map((s) => (
            <MenuItem key={s.id} value={s.label}>
              {s.label}
            </MenuItem>
          ))}
        </SelectField>

        {/* 3. Subject Select */}
        <SelectField
          fullWidth
          size="small"
          label={t('dialog.subject_label')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#94A3B8' },
            },
          }}
        >
          {MOCK_SUBJECT_CHOICES.map((subj) => (
            <MenuItem key={subj.id} value={subj.label}>
              {subj.label}
            </MenuItem>
          ))}
        </SelectField>

        {/* 4. Status Toggle Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              color="success"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#00A76F',
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isActive ? '#1E293B' : '#94A3B8',
              }}
            >
              {isActive ? t('dialog.active') : t('dialog.inactive')}
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: '#1E293B' }}
          >
            {t('dialog.status_label')}
          </Typography>
        </Box>

        {/* Bottom Actions */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2C353E' },
            }}
          >
            {isEdit ? t('dialog.save') : t('dialog.add')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
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
