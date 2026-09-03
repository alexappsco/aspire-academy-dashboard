'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { getFields, CreateSpecializationPayload } from 'src/actions/specializations';
import type { Specialization } from 'src/types/specialization';
import type { Field } from 'src/types/specialization';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: Specialization | null;
  onSave: (data: CreateSpecializationPayload) => void;
}

interface FormContentProps {
  initialData?: Specialization | null;
  onClose: () => void;
  onSave: (data: CreateSpecializationPayload) => void;
  isRtl: boolean;
}

function FormContent({ initialData, onClose, onSave, isRtl }: FormContentProps) {
  const t = useTranslations('Specializations');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [fieldId, setFieldId] = useState(initialData?.fieldId ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadFields = async () => {
      try {
        setFieldsLoading(true);
        const res = await getFields({ MaxResultCount: 1000 });
        if (isMounted && res.success && res.data) {
          setFields(res.data.items);
        }
      } catch {
        // silent
      } finally {
        if (isMounted) setFieldsLoading(false);
      }
    };

    loadFields();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = () => {
    if (!nameAr.trim() || !nameEn.trim() || !fieldId) return;
    onSave({ nameAr, nameEn, fieldId, isActive });
    onClose();
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
        }}
      >
        {isEdit ? t('edit_title') : t('add_title')}
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label={t('name_ar')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              ...(isRtl && {
                '& .MuiOutlinedInput-input': { textAlign: 'right' },
              }),
            }}
          />

          <TextField
            fullWidth
            label={t('name_en')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          />

          <TextField
            select
            fullWidth
            label={t('field')}
            value={fieldId}
            onChange={(e) => setFieldId(e.target.value)}
            required
            disabled={fieldsLoading}
            slotProps={{
              input: {
                startAdornment: fieldsLoading ? (
                  <CircularProgress size={18} sx={{ mr: 1 }} />
                ) : undefined,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            }}
          >
            {fields.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {isRtl ? f.nameAr : f.nameEn}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="success"
              />
            }
            label={t('is_active')}
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 1.5,
            bgcolor: '#1C252E',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {isEdit ? t('save') : t('add')}
        </Button>
      </DialogActions>
    </>
  );
}

export default function SpecializationFormDialog({
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
