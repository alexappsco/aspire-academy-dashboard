'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import type { CategoryFormValues, CategoryItem } from '../../types/category';

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: CategoryItem | null;
  loading?: boolean;
  onSave: (data: CategoryFormValues) => void | Promise<void>;
}

export default function CategoryFormDialog({
  open,
  onClose,
  initialData,
  loading = false,
  onSave,
}: CategoryFormDialogProps) {
  const t = useTranslations('Categories');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? '');
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [active, setActive] = useState(initialData?.isActive ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    await onSave({
      nameAr,
      nameEn,
      order,
      isActive: active,
      imageFile: selectedFile,
    });
  };

  const canSubmit = nameAr.trim() && nameEn.trim() && (isEdit || !!selectedFile);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: { sx: { borderRadius: 3, p: 1 } },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3, pb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, fontWeight: 500 }}>
          {t('dialog.subtitle')}
        </Typography>

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
            cursor: loading ? 'default' : 'pointer',
            mb: 3,
            '&:hover': loading ? undefined : { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
          }}
        >
          <input type="file" hidden accept="image/*" onChange={handleFileChange} disabled={loading} />
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt={nameEn || nameAr || 'preview'}
              sx={{ width: 72, height: 72, objectFit: 'contain', mb: 1.5, borderRadius: 1 }}
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

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            label={t('dialog.name_ar')}
            placeholder={t('dialog.name_ar_placeholder')}
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            disabled={loading}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
            }}
          />
          <TextField
            fullWidth
            size="small"
            label={t('dialog.name_en')}
            placeholder={t('dialog.name_en_placeholder')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            disabled={loading}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } },
            }}
          />
        </Box>

        <TextField
          fullWidth
          size="small"
          label={t('dialog.order')}
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          disabled={loading}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' } } }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {t('dialog.status')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={active}
              disabled={loading}
              onChange={(e) => setActive(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, color: active ? '#1E293B' : '#94A3B8' }}>
              {active ? t('status.active') : t('status.inactive')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
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
            {t('dialog.save')}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
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
