'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { CouponDto, CouponType, CreateCouponDto, COUPON_TYPE_MAP } from './types';

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

interface DiscountCodeFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: CouponDto | null;
  onSave: (data: CreateCouponDto) => void;
  loading?: boolean;
}

export default function DiscountCodeFormDialog({
  open,
  onClose,
  initialData,
  onSave,
  loading,
}: DiscountCodeFormDialogProps) {
  const t = useTranslations('DiscountCodes');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const isEdit = !!initialData;

  const [code, setCode] = useState(initialData?.code ?? '');
  const [type, setType] = useState<CouponType>(initialData?.type ? (COUPON_TYPE_MAP[initialData.type] || 'Percentage') : 'Percentage');
  const [value, setValue] = useState<string>(initialData ? String(initialData.value) : '');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>(initialData ? String(initialData.maxDiscountAmount) : '');
  const [minOrderAmount, setMinOrderAmount] = useState<string>(initialData ? String(initialData.minOrderAmount) : '');
  const [startAt, setStartAt] = useState(initialData?.startAt?.slice(0, 10) ?? '');
  const [endAt, setEndAt] = useState(initialData?.endAt?.slice(0, 10) ?? '');
  const [maxRedemptions, setMaxRedemptions] = useState<string>(initialData ? String(initialData.maxRedemptions) : '');
  const [maxRedemptionsPerStudent, setMaxRedemptionsPerStudent] = useState<string>(initialData ? String(initialData.maxRedemptionsPerStudent) : '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = () => {
    if (!code.trim() || !value) {
      return;
    }
    onSave({
      code,
      type,
      value: Number(value) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      minOrderAmount: Number(minOrderAmount) || 0,
      startAt: startAt ? new Date(startAt).toISOString() : new Date().toISOString(),
      endAt: endAt ? new Date(endAt).toISOString() : new Date().toISOString(),
      maxRedemptions: Number(maxRedemptions) || 0,
      maxRedemptionsPerStudent: Number(maxRedemptionsPerStudent) || 0,
      isActive,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: { sx: { borderRadius: '20px', p: 2, boxShadow: '0px 8px 32px rgba(0,0,0,0.08)' } },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          pt: 1,
          pb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 20 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>

        <IconButton onClick={onClose} size="small" sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2, pt: 1, pb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
          <TextField
            fullWidth
            label={t('dialog.code')}
            placeholder={t('dialog.code_placeholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          <SelectField
            fullWidth
            label={t('dialog.type')}
            value={type}
            onChange={(e) => setType(e.target.value as CouponType)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          >
            <MenuItem value="Percentage">{t('filters.percentage')}</MenuItem>
            <MenuItem value="Fixed">{t('filters.fixed')}</MenuItem>
          </SelectField>

          <TextField
            fullWidth
            type="number"
            label={t('dialog.value')}
            placeholder={t('dialog.value_placeholder')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          <TextField
            fullWidth
            type="number"
            label={t('dialog.minOrderAmount')}
            placeholder={t('dialog.minOrderAmount_placeholder')}
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          <TextField
            fullWidth
            type="number"
            label={t('dialog.maxDiscountAmount')}
            placeholder={t('dialog.maxDiscountAmount_placeholder')}
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          <TextField
            fullWidth
            type="number"
            label={t('dialog.maxRedemptions')}
            placeholder={t('dialog.maxRedemptions_placeholder')}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          <TextField
            fullWidth
            type="number"
            label={t('dialog.maxRedemptionsPerStudent')}
            placeholder={t('dialog.maxRedemptionsPerStudent_placeholder')}
            value={maxRedemptionsPerStudent}
            onChange={(e) => setMaxRedemptionsPerStudent(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          <TextField
            fullWidth
            type="date"
            label={t('dialog.startAt')}
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:calendar-bold" width={18} sx={{ color: '#919EAB' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={getTextFieldStyles(isRtl)}
          />

          <TextField
            fullWidth
            type="date"
            label={t('dialog.endAt')}
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:calendar-bold" width={18} sx={{ color: '#919EAB' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={getTextFieldStyles(isRtl)}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
          <FormControl component="fieldset">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormLabel component="legend" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>
                {t('dialog.status')}
              </FormLabel>
              <RadioGroup
                row
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
              >
                <FormControlLabel
                  value="active"
                  control={<Radio sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#00A76F' } }} />}
                  label={t('status.active')}
                  sx={{ color: '#1E293B', fontWeight: 600 }}
                />
                <FormControlLabel
                  value="inactive"
                  control={<Radio sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#00A76F' } }} />}
                  label={t('status.inactive')}
                  sx={{ color: '#1E293B', fontWeight: 600 }}
                />
              </RadioGroup>
            </Box>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', pt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!code.trim() || !value || loading}
            sx={{
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0F172A' },
            }}
          >
            {isEdit ? t('dialog.save_btn') : t('dialog.add_btn')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: '#CBD5E1',
              color: '#1E293B',
              borderRadius: 2,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 15,
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
            }}
          >
            {t('dialog.cancel_btn')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
