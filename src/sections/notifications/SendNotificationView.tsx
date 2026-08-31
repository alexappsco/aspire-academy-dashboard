'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import SelectField from 'src/components/SelectField/SelectField';

interface Props {
  onCancel: () => void;
  onSend: (newNotification: {
    title_ar: string;
    title_en: string;
    content_ar: string;
    content_en: string;
    userType: 'student' | 'lecturer';
    userName: string;
  }) => void;
}

export default function SendNotificationView({ onCancel, onSend }: Props) {
  const t = useTranslations('Notifications.send_form');

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [studentTarget, setStudentTarget] = useState('all');
  const [merchantTarget, setMerchantTarget] = useState('all');

  const handleSend = () => {
    if (!titleAr.trim() || !titleEn.trim() || !contentAr.trim() || !contentEn.trim()) {
      return;
    }
    // Triggers callback to add notification and go back to list
    onSend({
      title_ar: titleAr,
      title_en: titleEn,
      content_ar: contentAr,
      content_en: contentEn,
      userType: 'student', // Mock default target type
      userName: 'النظام',
    });
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Title */}
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 4 }}>
        {t('title')}
      </Typography>

      {/* Form Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          mb: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Grid container spacing={4}>
          {/* English Form Column (placed on left or right based on direction; here we order English/Arabic side by side) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
                  {t('title_en_label')}
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
                  {t('content_en_label')}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder={t('content_en_placeholder')}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
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

          {/* Arabic Form Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
                  {t('title_ar_label')}
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
                  {t('content_ar_label')}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder={t('content_ar_placeholder')}
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
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

      {/* Target Audiences Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          mb: 4,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Grid container spacing={3}>
          {/* Merchants Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
              {t('merchants_label')}
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={merchantTarget}
              onChange={(e) => setMerchantTarget(e.target.value)}
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
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active_merchants">النشطين</MenuItem>
            </SelectField>
          </Grid>

          {/* Students Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
              {t('students_label')}
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={studentTarget}
              onChange={(e) => setStudentTarget(e.target.value)}
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
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active_students">النشطين</MenuItem>
            </SelectField>
          </Grid>
        </Grid>
      </Card>

      {/* Form Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-start">
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!titleAr.trim() || !titleEn.trim() || !contentAr.trim() || !contentEn.trim()}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 4,
            py: 1,
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
          {t('send_btn')}
        </Button>

        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderColor: '#919EAB40',
            color: '#637381',
            borderRadius: 1.5,
            px: 4,
            py: 1,
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
