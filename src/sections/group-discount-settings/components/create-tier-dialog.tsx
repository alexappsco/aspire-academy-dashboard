'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import type { CreateSessionGroupDiscountTierPayload } from 'src/types/session-group-discount-setting';

type Props = {
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (data: CreateSessionGroupDiscountTierPayload) => Promise<boolean>;
};

export default function CreateTierDialog({ open, saving, onClose, onSave }: Props) {
  const t = useTranslations('GroupDiscountSettings.create');
  const isRtl = useLocale() === 'ar';
  const [minParticipants, setMinParticipants] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMinParticipants('');
    setDiscountPercentage('');
    setTouched(false);
  }, [open]);

  const participantsValid =
    minParticipants.trim() !== '' &&
    Number.isInteger(Number(minParticipants)) &&
    Number(minParticipants) >= 0;
  const percentageValid =
    discountPercentage.trim() !== '' &&
    Number.isFinite(Number(discountPercentage)) &&
    Number(discountPercentage) >= 0 &&
    Number(discountPercentage) <= 100;

  const submit = async () => {
    setTouched(true);
    if (!participantsValid || !percentageValid || saving) return;

    const created = await onSave({
      minParticipants: Number(minParticipants),
      discountPercentage: Number(discountPercentage),
    });
    if (created) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { dir: isRtl ? 'rtl' : 'ltr', sx: { borderRadius: 2.5 } } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, pt: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.25 }}>{t('subtitle')}</Typography>
        </Box>
        <IconButton onClick={onClose} disabled={saving} aria-label={t('cancel')}>
          <Iconify icon="mingcute:close-line" width={21} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
            ...(isRtl && {
              '& .MuiInputLabel-root': { right: 24, left: 'auto', transformOrigin: 'right' },
              '& .MuiInputLabel-shrink': {
                right: 24,
                left: 'auto',
                transform: 'translate(0, -6px) scale(0.75)',
              },
              '& .MuiOutlinedInput-notchedOutline legend': { textAlign: 'right' },
              '& .MuiInputBase-input': { textAlign: 'right' },
            }),
          }}
        >
          <TextField
            fullWidth
            type="number"
            label={t('minimum_label')}
            value={minParticipants}
            onChange={(event) => setMinParticipants(event.target.value)}
            error={touched && !participantsValid}
            helperText={touched && !participantsValid ? t('minimum_error') : ' '}
            disabled={saving}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('percentage_label')}
            value={discountPercentage}
            onChange={(event) => setDiscountPercentage(event.target.value)}
            error={touched && !percentageValid}
            helperText={touched && !percentageValid ? t('percentage_error') : ' '}
            disabled={saving}
            slotProps={{
              htmlInput: { min: 0, max: 100 },
              input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disabled={saving}
            onClick={() => void submit()}
            sx={{ minHeight: 44, bgcolor: '#17243E' }}
          >
            {saving && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}
            {t('save')}
          </Button>
          <Button fullWidth variant="outlined" disabled={saving} onClick={onClose}>
            {t('cancel')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
