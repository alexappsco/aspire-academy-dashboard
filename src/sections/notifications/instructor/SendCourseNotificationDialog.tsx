'use client';

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { useToast } from 'src/components/toast';
import { getCourses } from 'src/actions/courses';
import { sendInstructorNotificationAction } from 'src/actions/instructor-notifications';
import type { CourseDto } from 'src/types/course';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendCourseNotificationDialog({ open, onClose, onSuccess }: Props) {
  const t = useTranslations('InstructorNotifications.send_dialog');
  const toast = useToast();

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [messageAr, setMessageAr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchCourses = async () => {
        try {
          setLoadingCourses(true);
          const res = await getCourses({ SkipCount: 0, MaxResultCount: 200 });
          if (res.success && res.data) {
            setCourses(res.data.items || []);
            if (res.data.items?.length > 0 && !selectedCourseId) {
              setSelectedCourseId(res.data.items[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to load courses:', err);
        } finally {
          setLoadingCourses(false);
        }
      };

      fetchCourses();
    }
  }, [open, selectedCourseId]);

  const resetForm = () => {
    setTitleAr('');
    setTitleEn('');
    setMessageAr('');
    setMessageEn('');
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const handleSend = async () => {
    if (
      !selectedCourseId ||
      !titleAr.trim() ||
      !titleEn.trim() ||
      !messageAr.trim() ||
      !messageEn.trim()
    ) {
      toast.error(t('validation_required'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await sendInstructorNotificationAction({
        courseId: selectedCourseId,
        titleAr: titleAr.trim(),
        titleEn: titleEn.trim(),
        messageAr: messageAr.trim(),
        messageEn: messageEn.trim(),
      });

      if (res.success) {
        toast.success(t('send_success'));
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || t('send_error'));
      }
    } catch (err) {
      console.error('Failed to send course notification:', err);
      toast.error(err instanceof Error ? err.message : t('send_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    Boolean(selectedCourseId) &&
    Boolean(titleAr.trim()) &&
    Boolean(titleEn.trim()) &&
    Boolean(messageAr.trim()) &&
    Boolean(messageEn.trim());

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>
        <IconButton onClick={handleClose} size="small" disabled={submitting} sx={{ color: '#919EAB' }}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 2 }}>
        <Stack spacing={2.5}>
          {/* Course Selection */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1C252E', mb: 1 }}>
              {t('course_select_label')} *
            </Typography>
            {loadingCourses ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ color: '#637381' }}>
                  جاري تحميل الدورات...
                </Typography>
              </Box>
            ) : courses.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#DC2626' }}>
                {t('no_courses')}
              </Typography>
            ) : (
              <SelectField
                fullWidth
                size="small"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
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
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </SelectField>
            )}
          </Box>

          <Grid container spacing={3}>
            {/* Arabic Fields */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
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
                    {t('message_ar_label')} *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={t('message_ar_placeholder')}
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

            {/* English Fields */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
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
                    {t('message_en_label')} *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={t('message_en_placeholder')}
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
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!isFormValid || submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 3,
            fontWeight: 700,
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {submitting ? t('sending') : t('send_btn')}
        </Button>

        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={submitting}
          sx={{
            borderColor: '#919EAB40',
            color: '#637381',
            borderRadius: 1.5,
            px: 3,
            fontWeight: 700,
          }}
        >
          {t('cancel_btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
