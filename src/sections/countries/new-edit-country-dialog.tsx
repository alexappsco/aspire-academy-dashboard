'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { CountryDto, CurrencyDto, CreateCountryDto, UpdateCountryDto } from './types';

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

interface CountryFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: CountryDto | null;
  currencies?: CurrencyDto[];
  onSave: (data: CreateCountryDto | UpdateCountryDto) => Promise<void> | void;
  loading?: boolean;
}

interface FormContentProps {
  initialData?: CountryDto | null;
  currencies: CurrencyDto[];
  onClose: () => void;
  onSave: (data: CreateCountryDto | UpdateCountryDto) => Promise<void> | void;
  loading: boolean;
  isRtl: boolean;
}

function FormContent({
  initialData,
  currencies,
  onClose,
  onSave,
  loading,
  isRtl,
}: FormContentProps) {
  const t = useTranslations('Countries');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [code, setCode] = useState(initialData?.code ?? '');
  const [currencyId, setCurrencyId] = useState(
    initialData?.currencyId ?? initialData?.currency?.id ?? currencies[0]?.id ?? ''
  );
  const [order, setOrder] = useState<number | string>(initialData?.order ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      return;
    }

    await onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      code: code.trim() || null,
      currencyId: currencyId || null,
      order: Number(order) || 0,
      isActive,
    });
  };

  return (
    <>
      {/* Header with Title and Close Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          pt: 1,
          pb: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1E293B', fontSize: 20 }}
        >
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>

        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ color: '#919EAB' }}
        >
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2, pt: 1, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Arabic Name */}
          <TextField
            fullWidth
            label={t('dialog.name_ar')}
            placeholder={t('dialog.name_ar_placeholder')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            disabled={loading}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* English Name */}
          <TextField
            fullWidth
            label={t('dialog.name_en')}
            placeholder={t('dialog.name_en_placeholder')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            disabled={loading}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* Country Code */}
          <TextField
            fullWidth
            label={t('dialog.code')}
            placeholder={t('dialog.code_placeholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* Currency Selector */}
          {currencies.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#64748B',
                  mb: 0.5,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                {t('dialog.currency')}
              </Typography>
              <SelectField
                fullWidth
                value={currencyId}
                onChange={(e) => setCurrencyId(e.target.value)}
                disabled={loading}
                slotProps={{ select: { displayEmpty: true } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.9375rem',
                    '& fieldset': { borderColor: '#E5E7EB' },
                    '&:hover fieldset': { borderColor: '#B0B8C1' },
                    '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                  },
                }}
              >
                <MenuItem value="" sx={{ color: '#94A3B8' }}>
                  {t('dialog.currency_placeholder')}
                </MenuItem>
                {currencies.map((curr) => {
                  const currName = isRtl
                    ? (curr.nameAr || curr.name || curr.nameEn)
                    : (curr.nameEn || curr.name || curr.nameAr);
                  return (
                    <MenuItem key={curr.id} value={curr.id}>
                      {currName} ({curr.symbol || curr.code})
                    </MenuItem>
                  );
                })}
              </SelectField>
            </Box>
          )}

          {/* Display Order */}
          <TextField
            fullWidth
            type="number"
            label={t('dialog.order')}
            placeholder={t('dialog.order_placeholder')}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            disabled={loading}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* Status Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 0.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>
              {t('dialog.status')}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#00A76F',
                    '&:hover': { backgroundColor: 'rgba(0, 167, 111, 0.08)' },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#00A76F',
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: 14,
                  color: isActive ? '#00A76F' : '#64748B',
                  fontWeight: 600,
                }}
              >
                {isActive ? t('status.active') : t('status.inactive')}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', pt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !nameAr.trim() || !nameEn.trim()}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: 15,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {isEdit ? t('dialog.save_btn') : t('dialog.add_btn')}
            </Button>

            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              sx={{
                borderColor: '#D32F2F',
                color: '#D32F2F',
                borderRadius: 1.5,
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: 15,
                '&:hover': {
                  borderColor: '#B71C1C',
                  bgcolor: 'rgba(211, 47, 47, 0.04)',
                },
              }}
            >
              {t('dialog.cancel_btn')}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </>
  );
}

export default function CountryFormDialog({
  open,
  onClose,
  initialData,
  currencies = [],
  onSave,
  loading = false,
}: CountryFormDialogProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)',
          },
        },
      }}
    >
      {open && (
        <FormContent
          key={initialData?.id || 'new-country'}
          initialData={initialData}
          currencies={currencies}
          onClose={onClose}
          onSave={onSave}
          loading={loading}
          isRtl={isRtl}
        />
      )}
    </Dialog>
  );
}
