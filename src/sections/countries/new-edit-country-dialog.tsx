'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';

import Iconify from 'src/components/iconify';
import { CountryItem } from './_mock';

interface CountryFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: CountryItem | null;
  onSave: (data: Partial<CountryItem>) => void;
}

export default function CountryFormDialog({
  open,
  onClose,
  initialData,
  onSave,
}: CountryFormDialogProps) {
  const t = useTranslations('Countries');
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.name_ar ?? '');
  const [nameEn, setNameEn] = useState(initialData?.name_en ?? '');
  const [order, setOrder] = useState<number | string>(initialData?.order ?? '');
  const [active, setActive] = useState(initialData?.active ?? true);

  const handleSubmit = () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      return;
    }
    onSave({
      name_ar: nameAr,
      name_en: nameEn,
      order: Number(order) || 1,
      active,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      {/* Header with Close and Title */}
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
        <IconButton onClick={onClose} size="small" sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1E293B', fontSize: 20 }}
        >
          {isEdit ? t('dialog.edit_title') : t('dialog.add_title')}
        </Typography>
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
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#B0B8C1' },
                '&.Mui-focused fieldset': { borderColor: '#1B8354' },
              },
            }}
          />

          {/* English Name */}
          <TextField
            fullWidth
            label={t('dialog.name_en')}
            placeholder={t('dialog.name_en_placeholder')}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#B0B8C1' },
                '&.Mui-focused fieldset': { borderColor: '#1B8354' },
              },
            }}
          />

          {/* Display Order */}
          <TextField
            fullWidth
            type="number"
            label={t('dialog.order')}
            placeholder={t('dialog.order_placeholder')}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#B0B8C1' },
                '&.Mui-focused fieldset': { borderColor: '#1B8354' },
              },
            }}
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
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
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
              <Typography sx={{ fontSize: 14, color: active ? '#00A76F' : '#64748B', fontWeight: 600 }}>
                {active ? t('status.active') : t('status.inactive')}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', pt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!nameAr.trim() || !nameEn.trim()}
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
    </Dialog>
  );
}
