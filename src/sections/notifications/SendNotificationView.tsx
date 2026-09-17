'use client';

import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { useTranslations } from 'next-intl';

import SelectField from 'src/components/SelectField/SelectField';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { createAdminNotificationAction } from 'src/actions/admin-notifications';

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function SendNotificationView({ onCancel, onSuccess }: Props) {
  const t = useTranslations('Notifications.send_form');
  const tTypes = useTranslations('Notifications.types');
  const tUserTypes = useTranslations('Notifications.user_types');
  const toast = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [messageAr, setMessageAr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [type, setType] = useState<'General' | 'CoursePromo' | 'PurchaseComplete'>('General');
  const [targetRole, setTargetRole] = useState<'Student' | 'Instructor'>('Student');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!titleAr.trim() || !titleEn.trim() || !messageAr.trim() || !messageEn.trim()) {
      toast.error(t('validation_required'));
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('TitleAr', titleAr.trim());
      formData.append('TitleEn', titleEn.trim());
      formData.append('MessageAr', messageAr.trim());
      formData.append('MessageEn', messageEn.trim());
      formData.append('Type', type);
      formData.append('TargetRole', targetRole);

      if (imageFile) {
        formData.append('Image', imageFile);
      }

      const res = await createAdminNotificationAction(formData);

      if (res.success) {
        toast.success(t('send_success'));
        onSuccess();
      } else {
        toast.error(res.error || t('send_error'));
      }
    } catch (err) {
      console.error('Failed to create notification:', err);
      toast.error(err instanceof Error ? err.message : t('send_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    Boolean(titleAr.trim()) &&
    Boolean(titleEn.trim()) &&
    Boolean(messageAr.trim()) &&
    Boolean(messageEn.trim());

  return (
    <Box sx={{ py: 2 }}>
      {/* Page Title */}
      <Stack direction="row" sx={{ alignItems: 'center', mb: 3, gap: 1 }}>
        <Button
          variant="text"
          onClick={onCancel}
          sx={{ color: '#637381', minWidth: 'auto', p: 0.5, mr: 1 }}
        >
          <Iconify icon="solar:arrow-right-linear" width={24} />
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>
      </Stack>

      {/* Main Content Form Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3.5,
          mb: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Grid container spacing={4}>
          {/* English Fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
                  {t('title_en_label')} *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('title_en_placeholder')}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#F4F6F8',
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
                  {t('content_en_label')} *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder={t('content_en_placeholder')}
                  value={messageEn}
                  onChange={(e) => setMessageEn(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#F4F6F8',
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Arabic Fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
                  {t('title_ar_label')} *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('title_ar_placeholder')}
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#F4F6F8',
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
                  {t('content_ar_label')} *
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder={t('content_ar_placeholder')}
                  value={messageAr}
                  onChange={(e) => setMessageAr(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#F4F6F8',
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Target Audiences & Notification Configuration */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3.5,
          mb: 4,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Grid container spacing={3}>
          {/* Target Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
              {t('target_role_label')} *
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as 'Student' | 'Instructor')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F4F6F8',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                },
              }}
            >
              <MenuItem value="Student">{tUserTypes('Student')}</MenuItem>
              <MenuItem value="Instructor">{tUserTypes('Instructor')}</MenuItem>
            </SelectField>
          </Grid>

          {/* Notification Type */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
              {t('type_label')} *
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'General' | 'CoursePromo' | 'PurchaseComplete')
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F4F6F8',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: '#1B8354' },
                },
              }}
            >
              <MenuItem value="General">{tTypes('General')}</MenuItem>
              <MenuItem value="CoursePromo">{tTypes('CoursePromo')}</MenuItem>
              <MenuItem value="PurchaseComplete">{tTypes('PurchaseComplete')}</MenuItem>
            </SelectField>
          </Grid>

          {/* Image Upload Field */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
              {t('image_label')}
            </Typography>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <Box
                sx={{
                  position: 'relative',
                  width: 200,
                  height: 140,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid #E2E8F0',
                  bgcolor: '#F8FAFC',
                }}
              >
                <Box
                  component="img"
                  src={imagePreview}
                  alt="preview"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                  }}
                >
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<Iconify icon="solar:camera-add-bold" />}
                sx={{
                  borderStyle: 'dashed',
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  '&:hover': {
                    borderColor: '#1B8354',
                    bgcolor: '#F4FBF7',
                  },
                }}
              >
                {t('image_upload_btn')}
              </Button>
            )}
          </Grid>
        </Grid>
      </Card>

      {/* Form Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!isFormValid || submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 4,
            py: 1.25,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2C353E',
            },
            '&.Mui-disabled': {
              bgcolor: '#919EAB33',
              color: '#919EAB80',
            },
          }}
        >
          {submitting ? t('sending') : t('send_btn')}
        </Button>

        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={submitting}
          sx={{
            borderColor: '#919EAB40',
            color: '#637381',
            borderRadius: 1.5,
            px: 4,
            py: 1.25,
            fontWeight: 700,
            '&:hover': {
              borderColor: '#919EAB80',
              bgcolor: '#919EAB08',
            },
          }}
        >
          {t('cancel_btn')}
        </Button>
      </Stack>
    </Box>
  );
}
