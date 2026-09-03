'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { getFields } from 'src/actions/specializations';
import type { Specialization, Field } from 'src/types/specialization';

const getTextFieldStyles = (isRtl: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.9375rem',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#B0B8C1' },
    '&.Mui-focused fieldset': { borderColor: '#1B8354' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    ...(isRtl && { right: 24, left: 'auto', transformOrigin: 'right' }),
  },
  ...(isRtl && {
    '& .MuiInputLabel-shrink': {
      transform: 'translate(0, -6px) scale(0.75)',
      right: 24,
      left: 'auto',
    },
    '& .MuiOutlinedInput-notchedOutline legend': { textAlign: 'right' },
    '& .MuiOutlinedInput-input': { textAlign: 'right' },
  }),
});

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Specialization | null;
  onSave: (data: { nameAr: string; nameEn: string; fieldId: string; isActive: boolean }) => void;
}

export default function SpecializationFormDialog({ open, onClose, initialData, onSave }: Props) {
  const t = useTranslations('Specializations');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [fieldId, setFieldId] = useState(initialData?.fieldId ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFieldsLoading(true);
    getFields({ MaxResultCount: 1000 })
      .then((res) => {
        if (res.success && res.data) {
          setFields(res.data.items);
        }
      })
      .catch(() => {})
      .finally(() => setFieldsLoading(false));
  }, [open]);

  useEffect(() => {
    if (open) {
      setNameAr(initialData?.nameAr ?? '');
      setNameEn(initialData?.nameEn ?? '');
      setFieldId(initialData?.fieldId ?? '');
      setIsActive(initialData?.isActive ?? true);
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!nameAr.trim() || !nameEn.trim() || !fieldId) return;
    onSave({ nameAr, nameEn, fieldId, isActive });
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
          sx: { borderRadius: 3, p: 1.5, boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)' },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1, pb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 20 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2, pt: 1, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Field Selector */}
          <Box>
            <SelectField
              fullWidth
              label={t('dialog.field')}
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={getTextFieldStyles(isRtl)}
            >
              {fieldsLoading ? (
                <MenuItem value="" disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                fields.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {isRtl ? f.nameAr : f.nameEn}
                  </MenuItem>
                ))
              )}
            </SelectField>
          </Box>

          {/* Arabic Name */}
          <TextField
            fullWidth
            label={t('dialog.name_ar')}
            placeholder={t('dialog.name_ar_placeholder')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* English Name */}
          <TextField
            fullWidth
            label={t('dialog.name_en')}
            placeholder={t('dialog.name_en_placeholder')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* Status Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
            <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>
              {t('dialog.status')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
                }}
              />
              <Typography sx={{ fontSize: 14, color: isActive ? '#00A76F' : '#64748B', fontWeight: 600 }}>
                {isActive ? t('status.active') : t('status.inactive')}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', pt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!nameAr.trim() || !nameEn.trim() || !fieldId}
              sx={{
                bgcolor: '#1C252E', color: '#FFFFFF', borderRadius: 1.5, px: 4, py: 1,
                fontWeight: 600, fontSize: 15, boxShadow: 'none',
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {isEdit ? t('dialog.save_btn') : t('dialog.add_btn')}
            </Button>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: '#D32F2F', color: '#D32F2F', borderRadius: 1.5, px: 4, py: 1,
                fontWeight: 600, fontSize: 15,
                '&:hover': { borderColor: '#B71C1C', bgcolor: 'rgba(211, 47, 47, 0.04)' },
              }}
            >
              {t('dialog.cancel_btn')}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
