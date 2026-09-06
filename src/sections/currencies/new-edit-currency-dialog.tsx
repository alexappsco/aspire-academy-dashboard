'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import { CurrencyDto, CreateCurrencyDto, UpdateCurrencyDto } from './types';

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
    ...(isRtl && {
      right: 24,
      left: 'auto',
      transformOrigin: 'right',
    }),
  },
  ...(isRtl && {
    '& .MuiInputLabel-shrink': {
      transform: 'translate(0, -6px) scale(0.75)',
      right: 24,
      left: 'auto',
    },
    '& .MuiOutlinedInput-notchedOutline legend': {
      textAlign: 'right',
    },
    '& .MuiOutlinedInput-input': {
      textAlign: 'right',
    },
  }),
});

interface CurrencyFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: CurrencyDto | null;
  onSave: (data: CreateCurrencyDto | UpdateCurrencyDto) => Promise<void> | void;
  loading?: boolean;
}

interface FormContentProps {
  initialData?: CurrencyDto | null;
  onClose: () => void;
  onSave: (data: CreateCurrencyDto | UpdateCurrencyDto) => Promise<void> | void;
  loading: boolean;
  isRtl: boolean;
}

function FormContent({
  initialData,
  onClose,
  onSave,
  loading,
  isRtl,
}: FormContentProps) {
  const t = useTranslations('Currencies');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [symbol, setSymbol] = useState(initialData?.symbol ?? '');
  const [code, setCode] = useState(initialData?.code ?? '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [errors, setErrors] = useState<{
    nameAr?: boolean;
    nameEn?: boolean;
    symbol?: boolean;
    code?: boolean;
  }>({});

  const validate = () => {
    const newErrors: {
      nameAr?: boolean;
      nameEn?: boolean;
      symbol?: boolean;
      code?: boolean;
    } = {};

    if (!nameAr.trim()) newErrors.nameAr = true;
    if (!nameEn.trim()) newErrors.nameEn = true;
    if (!symbol.trim()) newErrors.symbol = true;
    if (!code.trim()) newErrors.code = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    await onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      symbol: symbol.trim(),
      code: code.trim(),
      isActive,
    });
  };

  const textFieldStyles = getTextFieldStyles(isRtl);

  return (
    <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#1E293B',
          }}
        >
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            '&:hover': { color: '#475569', bgcolor: '#F8FAFC' },
          }}
        >
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Stack>

      {/* Form Fields */}
      <Stack spacing={2.5}>
        {/* Name in Arabic */}
        <TextField
          fullWidth
          label={t('dialog.name_ar')}
          value={nameAr}
          onChange={(e) => {
            setNameAr(e.target.value);
            if (errors.nameAr) setErrors((prev) => ({ ...prev, nameAr: false }));
          }}
          error={errors.nameAr}
          helperText={errors.nameAr ? t('validation.name_ar_required') : ''}
          placeholder="درهم امارتي"
          sx={textFieldStyles}
        />

        {/* Name in English */}
        <TextField
          fullWidth
          label={t('dialog.name_en')}
          value={nameEn}
          onChange={(e) => {
            setNameEn(e.target.value);
            if (errors.nameEn) setErrors((prev) => ({ ...prev, nameEn: false }));
          }}
          error={errors.nameEn}
          helperText={errors.nameEn ? t('validation.name_en_required') : ''}
          placeholder="UAE Dirham"
          sx={textFieldStyles}
        />

        {/* Symbol in Arabic */}
        <TextField
          fullWidth
          label={t('dialog.symbol_ar')}
          value={symbol}
          onChange={(e) => {
            setSymbol(e.target.value);
            if (errors.symbol) setErrors((prev) => ({ ...prev, symbol: false }));
          }}
          error={errors.symbol}
          helperText={errors.symbol ? t('validation.symbol_required') : ''}
          placeholder="د.إ"
          sx={textFieldStyles}
        />

        {/* Symbol in English */}
        <TextField
          fullWidth
          label={t('dialog.symbol_en')}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (errors.code) setErrors((prev) => ({ ...prev, code: false }));
          }}
          error={errors.code}
          helperText={errors.code ? t('validation.code_required') : ''}
          placeholder="AED"
          sx={textFieldStyles}
        />

        {/* Code Field */}
        <TextField
          fullWidth
          label={t('dialog.code')}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (errors.code) setErrors((prev) => ({ ...prev, code: false }));
          }}
          error={errors.code}
          helperText={errors.code ? t('validation.code_required') : ''}
          placeholder="AED"
          sx={textFieldStyles}
        />

        {/* Active Status Switch */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1,
            px: 0.5,
          }}
        >
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B' }}>
            {t('dialog.status')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#10B981',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#10B981',
                },
              }}
            />
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#10B981' : '#94A3B8',
              }}
            >
              {isActive ? t('dialog.status_active') : t('dialog.status_inactive')}
            </Typography>
          </Stack>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              py: 1.25,
              borderRadius: 2,
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9375rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2C353E' },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : isEdit ? (
              t('dialog.save_button')
            ) : (
              t('dialog.add_button')
            )}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{
              py: 1.25,
              borderRadius: 2,
              borderColor: '#DC2626',
              color: '#DC2626',
              fontWeight: 700,
              fontSize: '0.9375rem',
              '&:hover': {
                borderColor: '#B91C1C',
                bgcolor: '#FEF2F2',
              },
            }}
          >
            {t('dialog.cancel_button')}
          </Button>
        </Stack>
      </Stack>
    </DialogContent>
  );
}

export default function CurrencyFormDialog({
  open,
  onClose,
  initialData,
  onSave,
  loading = false,
}: CurrencyFormDialogProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            m: 2,
            overflow: 'visible',
          },
        },
      }}
    >
      {open && (
        <FormContent
          initialData={initialData}
          onClose={onClose}
          onSave={onSave}
          loading={loading}
          isRtl={isRtl}
        />
      )}
    </Dialog>
  );
}
