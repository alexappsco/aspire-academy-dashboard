'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import type { AcademyCustomField, AcademyCustomFieldPayload } from 'src/types/academy-custom-field';

type Props = {
  open: boolean;
  field: AcademyCustomField | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: AcademyCustomFieldPayload) => Promise<boolean>;
};

export default function CustomFieldFormDialog({ open, field, saving, onClose, onSave }: Props) {
  const t = useTranslations('AcademyCustomFields.form');
  const isRtl = useLocale() === 'ar';
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKey(field?.key ?? '');
    setValue(field?.value ?? '');
    setSortOrder(String(field?.sortOrder ?? 0));
    setTouched(false);
  }, [field, open]);

  const orderNumber = Number(sortOrder);
  const valid =
    key.trim() !== '' &&
    value.trim() !== '' &&
    sortOrder.trim() !== '' &&
    Number.isInteger(orderNumber) &&
    orderNumber >= 0;

  const submit = async () => {
    setTouched(true);
    if (!valid || saving) return;
    const saved = await onSave({ key: key.trim(), value: value.trim(), sortOrder: orderNumber });
    if (saved) onClose();
  };

  const rtlStyles = isRtl
    ? {
        '& .MuiInputLabel-root': { right: 24, left: 'auto', transformOrigin: 'right' },
        '& .MuiInputLabel-shrink': {
          right: 24,
          left: 'auto',
          transform: 'translate(0, -6px) scale(0.75)',
        },
        '& .MuiOutlinedInput-notchedOutline legend': { textAlign: 'right' },
        '& .MuiInputBase-input, & textarea': { textAlign: 'right' },
      }
    : {};

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { dir: isRtl ? 'rtl' : 'ltr', sx: { borderRadius: 2.5 } } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, pt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {t(field ? 'edit_title' : 'add_title')}
        </Typography>
        <IconButton disabled={saving} onClick={onClose} aria-label={t('cancel')}>
          <Iconify icon="mingcute:close-line" width={21} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'grid', gap: 1.5, ...rtlStyles }}>
          <TextField
            label={t('key')}
            value={key}
            disabled={saving}
            onChange={(event) => setKey(event.target.value)}
            error={touched && key.trim() === ''}
            helperText={touched && key.trim() === '' ? t('required') : ' '}
          />
          <TextField
            label={t('value')}
            value={value}
            disabled={saving}
            multiline
            minRows={3}
            onChange={(event) => setValue(event.target.value)}
            error={touched && value.trim() === ''}
            helperText={touched && value.trim() === '' ? t('required') : ' '}
          />
          <TextField
            label={t('sort_order')}
            value={sortOrder}
            disabled={saving}
            type="number"
            onChange={(event) => setSortOrder(event.target.value)}
            error={touched && (!Number.isInteger(orderNumber) || orderNumber < 0)}
            helperText={touched && (!Number.isInteger(orderNumber) || orderNumber < 0) ? t('sort_error') : ' '}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ mt: 1 }}>
          <Button fullWidth variant="contained" disabled={saving} onClick={() => void submit()} sx={{ minHeight: 44, bgcolor: '#17243E' }}>
            {saving && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}
            {t('save')}
          </Button>
          <Button fullWidth variant="outlined" disabled={saving} onClick={onClose}>{t('cancel')}</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
