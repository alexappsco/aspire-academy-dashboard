'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { useToast } from 'src/components/toast';
import { getErrorMessage } from 'src/utils/axios';

import type { UniversityDto } from './types';
import type { CountryDto, CountriesListResponse } from 'src/sections/countries/types';
import { getCountriesAction } from 'src/actions/countries';

interface UniversityFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: UniversityDto | null;
  onSave: (data: {
    nameAr: string;
    nameEn: string;
    countryId: string;
    order: number;
    isActive: boolean;
    image?: File | null;
  }) => Promise<void> | void;
  loading?: boolean;
}

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

function FormContent({
  initialData,
  onClose,
  onSave,
  loading,
  isRtl,
}: {
  initialData?: UniversityDto | null;
  onClose: () => void;
  onSave: UniversityFormDialogProps['onSave'];
  loading: boolean;
  isRtl: boolean;
}) {
  const t = useTranslations('Universities');
  const toast = useToast();
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [countryId, setCountryId] = useState('');
  const [order, setOrder] = useState<number | string>(initialData?.order ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadCountries = async () => {
      try {
        const res = await getCountriesAction();
        if (isMounted && res.success && res.data) {
          const data = res.data as CountriesListResponse;
          if (Array.isArray(data.items)) {
            setCountries(data.items);
            if (initialData?.countryId) {
              setCountryId(initialData.countryId);
            }
          }
        }
      } catch (error: unknown) {
        if (isMounted) {
          toast.error(getErrorMessage(error) || 'Failed to load countries');
        }
      } finally {
        if (isMounted) {
          setCountriesLoading(false);
        }
      }
    };
    loadCountries();
    return () => { isMounted = false; };
  }, [toast, initialData?.countryId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!nameAr.trim() || !nameEn.trim() || !countryId) {
      return;
    }

    await onSave({
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      countryId,
      order: Number(order) || 0,
      isActive,
      image: selectedFile,
    });
  };

  return (
    <>
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
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: 20 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
        <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2, pt: 1, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Image Upload */}
          <Box
            component="label"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              bgcolor: '#F8FAFC',
              border: '1.5px dashed #CBD5E1',
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
            }}
          >
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#E6F4EA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  width={48}
                  height={48}
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <Iconify icon="eva:folder-open-outline" sx={{ fontSize: 32, color: '#00A76F' }} />
              )}
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
              {selectedFile ? selectedFile.name : t('dialog.select_image')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
              {t('dialog.drag_drop')}{' '}
              <span style={{ color: '#00A76F', textDecoration: 'underline' }}>
                {t('dialog.browse')}
              </span>
            </Typography>
          </Box>

          {/* Country Selector */}
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
              {t('dialog.country')}
            </Typography>
            <SelectField
              fullWidth
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
              disabled={loading || countriesLoading}
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
                {t('dialog.country_placeholder')}
              </MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {isRtl ? country.nameAr : country.nameEn}
                </MenuItem>
              ))}
            </SelectField>
          </Box>

          {/* Arabic Name */}
          <TextField
            fullWidth
            label={t('dialog.name_ar')}
            placeholder={t('dialog.name_ar_placeholder')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            disabled={loading}
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
            disabled={loading}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* Order */}
          <TextField
            fullWidth
            type="number"
            label={t('dialog.order')}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            disabled={loading}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={getTextFieldStyles(isRtl)}
          />

          {/* Status Toggle */}
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
              disabled={loading || !nameAr.trim() || !nameEn.trim() || !countryId}
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
              {isEdit ? t('dialog.save') : t('dialog.add_btn')}
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
              {t('dialog.cancel')}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </>
  );
}

export default function UniversityFormDialog({
  open,
  onClose,
  initialData,
  onSave,
  loading = false,
}: UniversityFormDialogProps) {
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
          key={initialData?.id || 'new-university'}
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
