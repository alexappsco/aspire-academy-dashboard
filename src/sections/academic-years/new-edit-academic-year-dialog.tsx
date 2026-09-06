'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import type { AcademicYearFormValues, AcademicYearItem } from 'src/types/academic-year';

interface AcademicYearFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: AcademicYearItem | null;
  loading?: boolean;
  onSave: (data: AcademicYearFormValues) => void | Promise<void>;
}

export default function AcademicYearFormDialog({
  open,
  onClose,
  initialData,
  loading = false,
  onSave,
}: AcademicYearFormDialogProps) {
  const t = useTranslations('AcademicYears');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [active, setActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async () => {
    await onSave({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      isActive: active,
    });
  };

  const canSubmit = nameAr.trim() && nameEn.trim();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { borderRadius: 3, p: 1 } },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 2.5 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>

        <TextField
          fullWidth
          size="small"
          label={t('dialog.name_ar')}
          placeholder={t('dialog.name_ar_placeholder')}
          value={nameAr}
          onChange={(e) => setNameAr(e.target.value)}
          disabled={loading}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{
            mb: 2.5,
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
          disabled={loading}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {t('dialog.status')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={active}
              disabled={loading}
              onChange={(e) => setActive(e.target.checked)}
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

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
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
            {isEdit ? t('dialog.save') : t('dialog.add')}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
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
