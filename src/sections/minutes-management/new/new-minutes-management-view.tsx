'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'src/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import MenuItem from '@mui/material/MenuItem';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';

interface MinutesFormViewProps {
  id?: string;
}

const inputRootSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: '#E5E7EB' },
  },
};

export default function NewMinutesManagementView({ id }: MinutesFormViewProps) {
  const t = useTranslations('MinutesManagement');
  const router = useRouter();
  const locale = useLocale();

  const avatarRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    country: '',
    university: '',
    qualification: '',
    startDate: '',
    bio: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    console.log('Creating lecturer:', formData);
    router.push(`/${locale}/minutes-management`);
  };

  const handleCancel = () => {
    router.push(`/${locale}/minutes-management`);
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { level: 0, label: '' };
    if (password.length < 4) return { level: 1, label: t('password_strength_weak') };
    if (password.length < 8) return { level: 2, label: '' };
    return { level: 3, label: '' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Box>
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { mx: 1, color: '#94A3B8' } }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push('/')}
              sx={{ cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 500 }}
            >
              {t('breadcrumb_dashboard')}
            </Link>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push(`/${locale}/minutes-management`)}
              sx={{ cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 500 }}
            >
              {t('breadcrumb_lecturers')}
            </Link>
            <Typography sx={{ fontSize: 13, color: '#1E293B', fontWeight: 600 }}>
              {t('breadcrumb_add_lecturer')}
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('page_title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {t('page_subtitle')}
          </Typography>
        </Box>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          mb: 3,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E', mb: 1 }}>
            {t('section_personal_info')}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flexShrink: 0 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 3,
                  border: '2px dashed #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  bgcolor: avatarPreview ? 'transparent' : '#F9FAFB',
                  backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#94A3B8' },
                }}
                onClick={() => avatarRef.current?.click()}
              >
                {!avatarPreview && (
                  <>
                    <Iconify icon="solar:camera-minimalistic-bold" width={28} sx={{ color: '#94A3B8', mb: 0.5 }} />
                  </>
                )}
              </Box>
              <input
                ref={avatarRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => avatarRef.current?.click()}
                sx={{
                  mt: 1.5,
                  borderColor: '#BFDBFE',
                  color: '#1D4ED8',
                  bgcolor: '#EFF6FF',
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#93C5FD', bgcolor: '#DBEAFE' },
                }}
              >
                {t('upload_photo')}
              </Button>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5, textAlign: 'center' }}>
                {t('photo_hint')}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('field_full_name')}
                    required
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputRootSx}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t('field_title')}
                    value={formData.title}
                    onChange={handleChange('title')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputRootSx}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('field_country')}
                    required
                    value={formData.country}
                    onChange={handleChange('country')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputRootSx}
                  />
                  <SelectField
                    fullWidth
                    size="small"
                    label={t('field_university')}
                    value={formData.university}
                    onChange={handleSelectChange('university')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputRootSx}
                  >
                    <MenuItem value="" disabled>
                      {t('field_university')}
                    </MenuItem>
                  </SelectField>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('field_qualification')}
                    value={formData.qualification}
                    onChange={handleChange('qualification')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputRootSx}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t('field_start_date')}
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange('startDate')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputRootSx}
                  />
                </Stack>

                <TextField
                  fullWidth
                  size="small"
                  label={t('field_bio')}
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={inputRootSx}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          mb: 3,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('section_login_credentials')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            {t('login_credentials_subtitle')}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />

          <Stack spacing={2.5}>
            <TextField
              fullWidth
              size="small"
              label={t('field_email')}
              required
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={inputRootSx}
            />

            <Box>
              <TextField
                fullWidth
                size="small"
                label={t('field_password')}
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputRootSx}
              />
              {formData.password && (
                <Box sx={{ mt: 1.5 }}>
                  <Stack direction="row" spacing={0.75} sx={{ mb: 0.5 }}>
                    {[1, 2, 3].map((segment) => (
                      <Box
                        key={segment}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor:
                            segment <= passwordStrength.level
                              ? passwordStrength.level <= 1
                                ? '#EF4444'
                                : passwordStrength.level === 2
                                ? '#F59E0B'
                                : '#22C55E'
                              : '#E5E7EB',
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 500 }}>
                    {passwordStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              size="small"
              label={t('field_confirm_password')}
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputRootSx}
            />
          </Stack>
        </Box>
      </Card>

      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<Iconify icon="mingcute:check-line" width={20} />}
          sx={{
            bgcolor: '#1E293B',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 4,
            py: 1.2,
            fontWeight: 600,
            '&:hover': { bgcolor: '#0F172A' },
          }}
        >
          {t('btn_create_lecturer')}
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            borderColor: '#CBD5E1',
            color: '#1E293B',
            borderRadius: 1.5,
            px: 4,
            py: 1.2,
            fontWeight: 600,
            '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
          }}
        >
          {t('btn_cancel')}
        </Button>
      </Stack>
    </Box>
  );
}
