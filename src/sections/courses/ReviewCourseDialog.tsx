'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { useToast } from 'src/components/toast';
import { reviewCourse } from 'src/actions/courses';
import { getCurrenciesAction } from 'src/actions/currencies';
import type { CourseDto, CourseReviewPayload } from 'src/types/course';

type ReviewMode = 'accept' | 'reject';

interface ReviewCourseDialogProps {
  open: boolean;
  course: CourseDto | null;
  onClose: () => void;
  onReviewed: () => void;
}

interface CurrencyOption {
  id: string;
  name: string;
  symbol: string;
}

export default function ReviewCourseDialog({
  open,
  course,
  onClose,
  onReviewed,
}: ReviewCourseDialogProps) {
  const t = useTranslations('Courses.ReviewCourse');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [mode, setMode] = useState<ReviewMode>('accept');
  const [rejectionReason, setRejectionReason] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [platformPercentage, setPlatformPercentage] = useState('');
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Fetch currencies on mount / open
  useEffect(() => {
    if (open) {
      setLoadingCurrencies(true);
      getCurrenciesAction({ IsActive: true, MaxResultCount: 1000 })
        .then((res) => {
          if (res.success && res.data) {
            setCurrencies(
              res.data.items.map((item) => ({
                id: item.id,
                name: isRtl ? item.nameAr : item.nameEn,
                symbol: item.symbol,
              }))
            );
          }
        })
        .finally(() => setLoadingCurrencies(false));
    }
  }, [open, isRtl]);

  // Initialize form values from selected course
  useEffect(() => {
    if (open && course) {
      setMode('accept');
      setRejectionReason('');
      setPrice(course.price != null && course.price > 0 ? String(course.price) : '');
      setOldPrice(course.oldPrice != null && course.oldPrice > 0 ? String(course.oldPrice) : '');
      setCurrencyId(course.currencyId || course.currency?.id || '');
      setPlatformPercentage(
        course.platformPercentage != null ? String(course.platformPercentage) : ''
      );
      setError('');
      setTouched(false);
    }
  }, [open, course]);

  // If no currency selected, default to first available
  useEffect(() => {
    if (currencies.length > 0 && !currencyId) {
      setCurrencyId(course?.currencyId || course?.currency?.id || currencies[0].id);
    }
  }, [currencies, currencyId, course]);

  const percentage = platformPercentage === '' ? NaN : Number(platformPercentage);
  const isPercentageInvalid = !Number.isNaN(percentage) && (percentage < 0 || percentage > 100);

  const platformHint = t('platform_percentage_hint');
  const showPercentageError = touched && platformPercentage !== '' && isPercentageInvalid;
  const showPriceError = touched && mode === 'accept' && price.trim() === '';
  const showCurrencyError = touched && mode === 'accept' && !currencyId;

  const handleSubmit = async () => {
    if (!course) return;

    setTouched(true);

    if (mode === 'reject') {
      if (!rejectionReason.trim()) {
        setError(t('rejection_reason_required'));
        return;
      }
    } else {
      if (price.trim() === '') {
        setError(t('price_required'));
        return;
      }
      const numPrice = Number(price);
      if (Number.isNaN(numPrice) || numPrice < 0) {
        setError(t('price_required'));
        return;
      }
      if (!currencyId) {
        setError(t('currency_required'));
        return;
      }
      if (isPercentageInvalid) {
        setError(t('platform_percentage_invalid'));
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const payload: CourseReviewPayload = {
        accept: mode === 'accept',
        rejectionReason: mode === 'reject' ? rejectionReason.trim() : undefined,
        price: mode === 'accept' && price.trim() !== '' ? Number(price) : 0,
        oldPrice: mode === 'accept' && oldPrice.trim() !== '' ? Number(oldPrice) : 0,
        currencyId: mode === 'accept' ? currencyId || undefined : undefined,
        platformPercentage: mode === 'accept' && !Number.isNaN(percentage) ? percentage : undefined,
      };

      const res = await reviewCourse(course.id, payload);
      if (res.success) {
        toast.success(mode === 'accept' ? t('accepted') : t('rejected'));
        onReviewed();
        onClose();
      } else {
        setError(res.error || t('submit_failed'));
      }
    } catch {
      setError(t('submit_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const currentMode = mode === 'accept';

  const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
    '& .MuiInputBase-input': {
      textAlign: isRtl ? 'right' : 'left',
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      '&[type=number]': {
        MozAppearance: 'textfield',
      },
    },
    '& .MuiFormHelperText-root': { textAlign: isRtl ? 'right' : 'left' },
    ...(isRtl && {
      '& .MuiInputLabel-root': {
        right: 14,
        left: 'auto',
        transformOrigin: 'top right',
      },
      '& .MuiInputLabel-shrink': {
        transform: 'translate(-10px, -9px) scale(0.75)',
      },
      '& .MuiOutlinedInput-notchedOutline legend': {
        textAlign: 'right',
        marginLeft: 'auto',
      },
    }),
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      fullWidth
      maxWidth="sm"
      dir={isRtl ? 'rtl' : 'ltr'}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 3,
            position: 'relative',
          },
        },
      }}
    >
      {/* Top Close Button */}
      <IconButton
        onClick={onClose}
        disabled={submitting}
        size="small"
        sx={{
          position: 'absolute',
          top: 16,
          left: isRtl ? 16 : 'auto',
          right: isRtl ? 'auto' : 16,
          color: 'text.secondary',
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <Iconify icon="mingcute:close-line" width={20} />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        {/* Title & Subtitle */}
        <Box sx={{ mb: 3, textAlign: isRtl ? 'right' : 'left' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5, fontSize: 18 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: 14 }}>
            {course?.title || ''}
          </Typography>
        </Box>

        {/* Accept / Reject Toggle Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <Button
            fullWidth
            variant={currentMode ? 'contained' : 'outlined'}
            onClick={() => {
              setMode('accept');
              setError('');
            }}
            sx={{
              py: 1.25,
              borderRadius: 1.5,
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              boxShadow: 'none',
              ...(currentMode
                ? { bgcolor: '#137333', '&:hover': { bgcolor: '#0F5F2B' } }
                : { color: '#137333', borderColor: '#137333', '&:hover': { bgcolor: '#E6F4EA' } }),
            }}
          >
            <Iconify icon="solar:shield-check-bold" width={22} />
            <span>{t('accept')}</span>
          </Button>

          <Button
            fullWidth
            variant={!currentMode ? 'contained' : 'outlined'}
            onClick={() => {
              setMode('reject');
              setError('');
            }}
            sx={{
              py: 1.25,
              borderRadius: 1.5,
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              boxShadow: 'none',
              ...(!currentMode
                ? { bgcolor: '#C5221F', '&:hover': { bgcolor: '#A41E1B' } }
                : { color: '#C5221F', borderColor: '#C5221F', '&:hover': { bgcolor: '#FCE8E6' } }),
            }}
          >
            <Iconify icon="solar:shield-warning-bold" width={22} />
            <span>{t('reject')}</span>
          </Button>
        </Stack>

        {/* Form Body: Accept Fields vs Reject Reason */}
        {currentMode ? (
          <Stack spacing={2.5} sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: '#475569', fontSize: 14, textAlign: isRtl ? 'right' : 'left' }}
            >
              {t('accept_desc')}
            </Typography>

            {/* Row 1: Current Price + Old Price */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('price_label')}
                  placeholder={t('price_placeholder')}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setError('');
                  }}
                  slotProps={{
                    htmlInput: { min: 0, step: 'any' },
                  }}
                  error={showPriceError}
                  helperText={showPriceError ? t('price_required') : ''}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  sx={inputSx}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('old_price_label')}
                  placeholder={t('old_price_placeholder')}
                  value={oldPrice}
                  onChange={(e) => {
                    setOldPrice(e.target.value);
                    setError('');
                  }}
                  slotProps={{
                    htmlInput: { min: 0, step: 'any' },
                  }}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  sx={inputSx}
                />
              </Box>
            </Stack>

            {/* Row 2: Currency + Platform Percentage */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <SelectField
                  fullWidth
                  size="small"
                  label={t('currency_label')}
                  value={currencyId}
                  onChange={(e) => {
                    setCurrencyId(e.target.value);
                    setError('');
                  }}
                  error={showCurrencyError}
                  helperText={showCurrencyError ? t('currency_required') : ''}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  slotProps={{
                    select: {
                      displayEmpty: true,
                      IconComponent: loadingCurrencies
                        ? () => <CircularProgress size={16} sx={{ mr: 1 }} />
                        : undefined,
                    },
                  }}
                  sx={inputSx}
                >
                  <MenuItem value="" disabled sx={{ justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
                    {loadingCurrencies ? '...' : t('currency_placeholder')}
                  </MenuItem>
                  {currencies.map((item) => (
                    <MenuItem
                      key={item.id}
                      value={item.id}
                      sx={{ justifyContent: isRtl ? 'flex-end' : 'flex-start' }}
                    >
                      {item.name} {item.symbol ? `(${item.symbol})` : ''}
                    </MenuItem>
                  ))}
                </SelectField>
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t('platform_percentage_label')}
                  placeholder="0 - 100"
                  value={platformPercentage}
                  onChange={(e) => {
                    setPlatformPercentage(e.target.value);
                    setError('');
                  }}
                  helperText={
                    error && error !== t('platform_percentage_invalid')
                      ? ''
                      : platformHint
                  }
                  error={showPercentageError || error === t('platform_percentage_invalid')}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  slotProps={{
                    htmlInput: { min: 0, max: 100 },
                  }}
                  sx={inputSx}
                />
              </Box>
            </Stack>
          </Stack>
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label={t('rejection_reason_label')}
            placeholder={t('rejection_reason_placeholder')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={!!error && mode === 'reject'}
            dir={isRtl ? 'rtl' : 'ltr'}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
              '& .MuiInputBase-input': { textAlign: isRtl ? 'right' : 'left' },
            }}
          />
        )}

        {/* Global Error Message */}
        {error &&
          !error.startsWith(t('platform_percentage_invalid')) &&
          error !== t('price_required') &&
          error !== t('currency_required') &&
          error !== t('rejection_reason_required') && (
            <Typography
              variant="body2"
              sx={{ color: '#C5221F', fontSize: 13, mb: 2, textAlign: isRtl ? 'right' : 'left' }}
            >
              {error}
            </Typography>
          )}

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: currentMode ? '#137333' : '#C5221F',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: currentMode ? '#0F5F2B' : '#A41E1B',
              },
            }}
          >
            {submitting ? t('submitting') : t('submit')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={{
              borderColor: '#CBD5E1',
              color: '#64748B',
              borderRadius: 1.5,
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            {t('cancel')}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}