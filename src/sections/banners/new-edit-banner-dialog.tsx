'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import Iconify from 'src/components/iconify';
import DateInput from 'src/components/DateInput';
import { useToast } from 'src/components/toast';
import { createBanner, updateBanner } from 'src/actions/banners';
import type { BannerDto } from 'src/types/banner';

interface BannerFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: BannerDto | null;
  onSuccess: () => void;
}

export default function BannerFormDialog({
  open,
  onClose,
  initialData,
  onSuccess,
}: BannerFormDialogProps) {
  const t = useTranslations('Banners');
  const toast = useToast();
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [externalUrl, setExternalUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setNameAr(initialData.nameAr || '');
      setNameEn(initialData.nameEn || '');
      setStartAt(initialData.startAt ? initialData.startAt.split('T')[0] : '');
      setEndAt(initialData.endAt ? initialData.endAt.split('T')[0] : '');
      setOrder(initialData.order ?? 0);
      setExternalUrl(initialData.externalUrl || '');
      setIsActive(initialData.isActive ?? true);
      setPreviewUrl(initialData.imageUrl || null);
      setSelectedFile(null);
    } else {
      setNameAr('');
      setNameEn('');
      setStartAt('');
      setEndAt('');
      setOrder(0);
      setExternalUrl('');
      setIsActive(true);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!nameAr.trim()) {
      toast.warning('يرجى إدخال اسم البنر بالعربية');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('NameAr', nameAr.trim());
      formData.append('NameEn', nameEn.trim() || nameAr.trim());
      formData.append('Order', String(order));
      formData.append('IsActive', String(isActive));
      if (startAt) formData.append('StartAt', new Date(startAt).toISOString());
      if (endAt) formData.append('EndAt', new Date(endAt).toISOString());
      if (externalUrl.trim()) formData.append('ExternalUrl', externalUrl.trim());
      if (selectedFile) {
        formData.append('Image', selectedFile);
      }

      let res;
      if (isEdit && initialData) {
        res = await updateBanner(initialData.id, formData);
      } else {
        res = await createBanner(formData);
      }

      if (res.success) {
        toast.success(isEdit ? 'تم تحديث البنر بنجاح' : 'تم إضافة البنر بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'فشلت العملية');
      }
    } catch {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { borderRadius: 3, p: 1 } },
      }}
    >
      {/* Header with close button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, fontWeight: 500 }}>
          {t('dialog.subtitle')}
        </Typography>

        {/* File Upload Drop Area */}
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
            mb: 3,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: '#F1F5F9',
              borderColor: '#94A3B8',
            },
          }}
        >
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />

          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 140,
                objectFit: 'contain',
                borderRadius: 1.5,
                mb: 1.5,
              }}
            />
          ) : (
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
              <Iconify icon="eva:folder-open-outline" sx={{ fontSize: 32, color: '#00A76F' }} />
            </Box>
          )}

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

        {/* Name Fields Row */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
              الاسم (عربي)*
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="اسم البنر بالعربية"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
              الاسم (إنجليزي)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Banner Name (English)"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Start Date & End Date Row */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
              {t('start_date')}
            </Typography>
            <DateInput
              fullWidth
              size="small"
              placeholder="DD/MM/YYYY"
              value={startAt}
              onChange={setStartAt}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
              {t('end_date')}
            </Typography>
            <DateInput
              fullWidth
              size="small"
              placeholder="DD/MM/YYYY"
              value={endAt}
              onChange={setEndAt}
            />
          </Grid>
        </Grid>

        {/* External URL & Order Row */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
              رابط التوجيه الخارجي (External URL)
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="https://example.com"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
              الترتيب (Order)
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Status Toggle Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {t('dialog.banner_status')}
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
            <Typography variant="body2" sx={{ fontWeight: 600, color: isActive ? '#1E293B' : '#94A3B8' }}>
              {isActive ? t('status.active') : t('status.inactive')}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
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
            {submitting ? 'جاري الحفظ...' : t('dialog.save')}
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
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

