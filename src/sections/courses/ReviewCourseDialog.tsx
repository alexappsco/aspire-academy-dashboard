// 'use client';

// import { useEffect, useState } from 'react';
// import { useLocale, useTranslations } from 'next-intl';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogContent from '@mui/material/DialogContent';
// import IconButton from '@mui/material/IconButton';
// import TextField from '@mui/material/TextField';
// import Iconify from 'src/components/iconify';
// import { useToast } from 'src/components/toast';
// import { reviewCourse } from 'src/actions/courses';
// import type { CourseDto } from 'src/types/course';


// type ReviewMode = 'accept' | 'reject';

// interface ReviewCourseDialogProps {
//   open: boolean;
//   course: CourseDto | null;
//   onClose: () => void;
//   onReviewed: () => void;
// }

// export default function ReviewCourseDialog({
//   open,
//   course,
//   onClose,
//   onReviewed,
// }: ReviewCourseDialogProps) {
//   const t = useTranslations('Courses.ReviewCourse');
//   const toast = useToast();
//  const locale =useLocale();
//   const [mode, setMode] = useState<ReviewMode>('accept');
//   const [rejectionReason, setRejectionReason] = useState('');
//   const [platformPercentage, setPlatformPercentage] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [touched, setTouched] = useState(false);

//   useEffect(() => {
//     if (open) {
//       setMode('accept');
//       setRejectionReason('');
//       setPlatformPercentage('');
//       setError('');
//       setTouched(false);
//     }
//   }, [open, course]);

//   const percentage = platformPercentage === '' ? NaN : Number(platformPercentage);
//   const isPercentageInvalid = !Number.isNaN(percentage) && (percentage < 0 || percentage > 100);

//   const platformHint = t('platform_percentage_hint');
//   const showPercentageError = touched && platformPercentage !== '' && isPercentageInvalid;

//   const handleSubmit = async () => {
//     if (!course) return;

//     setTouched(true);
//     if (mode === 'reject' && !rejectionReason.trim()) {
//       setError(t('rejection_reason_required'));
//       return;
//     }
//     if (isPercentageInvalid) {
//       setError(t('platform_percentage_invalid'));
//       return;
//     }

//     setSubmitting(true);
//     setError('');
//     try {
//       const res = await reviewCourse(course.id, {
//         accept: mode === 'accept',
//         rejectionReason: mode === 'reject' ? rejectionReason.trim() : undefined,
//         platformPercentage: Number.isNaN(percentage) ? undefined : percentage,
//       });
//       if (res.success) {
//         toast.success(mode === 'accept' ? t('accepted') : t('rejected'));
//         onReviewed();
//         onClose();
//       } else {
//         setError(res.error || t('submit_failed'));
//       }
//     } catch {
//       setError(t('submit_failed'));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const currentMode = mode === 'accept';

//   return (
//     <Dialog
//       open={open}
//       onClose={() => !submitting && onClose()}
//       fullWidth
//       maxWidth="sm"
//       slotProps={{
//         paper: {
//           sx: { borderRadius: 3, p: 1.5 },
//         },
//       }}
//     >
//       <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 0.5 }}>
//         <IconButton onClick={onClose} size="small" disabled={submitting}>
//           <Iconify icon="mingcute:close-line" width={20} />
//         </IconButton>
//       </Box>

//       <DialogContent sx={{ pt: 1, pb: 3, px: 3 }}>
//         <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5, fontSize: 18 }}>
//           {t('title')}
//         </Typography>
//         <Typography variant="body2" sx={{ color: '#64748B', mb: 3, fontSize: 14 }}>
//           {course?.title || ''}
//         </Typography>

//         {/* Accept / Reject toggle */}
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
//           <Button
//             fullWidth
//             variant={currentMode ? 'contained' : 'outlined'}
//             startIcon={<Iconify icon="solar:shield-check-bold" />}
//             onClick={() => {
//               setMode('accept');
//               setError('');
//             }}
//             sx={
//               currentMode
//                 ? { bgcolor: '#137333', '&:hover': { bgcolor: '#0F5F2B' }, py: 1.25, boxShadow: 'none' }
//                 : { color: '#137333', borderColor: '#137333', py: 1.25, '&:hover': { bgcolor: '#E6F4EA' } }
//             }
//           >
//             {t('accept')}
//           </Button>
//           <Button
//             fullWidth
//             variant={!currentMode ? 'contained' : 'outlined'}
//             startIcon={<Iconify icon="solar:shield-warning-bold" />}
//             onClick={() => {
//               setMode('reject');
//               setError('');
//             }}
//             sx={
//               !currentMode
//                 ? { bgcolor: '#C5221F', '&:hover': { bgcolor: '#A41E1B' }, py: 1.25, boxShadow: 'none' }
//                 : { color: '#C5221F', borderColor: '#C5221F', py: 1.25, '&:hover': { bgcolor: '#FCE8E6' } }
//             }
//           >
//             {t('reject')}
//           </Button>
//         </Stack>

//         {currentMode ? (
//           <Typography variant="body2" sx={{ color: '#475569', fontSize: 14, mb: 3 }}>
//             {t('accept_desc')}
//           </Typography>
//         ) : (
//           <TextField
//             fullWidth
//             multiline
//             minRows={3}
//             size="small"
//             label={t('rejection_reason_label')}
//             placeholder={t('rejection_reason_placeholder')}
//             value={rejectionReason}
//             onChange={(e) => setRejectionReason(e.target.value)}
//             error={!!error && mode === 'reject'}
//             sx={{ mb: 3 }}
//           />
//         )}

//         <TextField
//           fullWidth
//           size="small"
//           type="number"
//           label={t('platform_percentage_label')}
//           placeholder="0 - 100"
//           value={platformPercentage}
//           onChange={(e) => {
//             setPlatformPercentage(e.target.value);
//             setError('');
//           }}
//           helperText={error && error !== t('platform_percentage_invalid') ? '' : platformHint}
//           error={showPercentageError || error === t('platform_percentage_invalid')}
//           slotProps={{
//             htmlInput: { min: 0, max: 100 },
//           }}
//           sx={{ mb: 3 }}
//         />

//         {error && !error.startsWith(t('platform_percentage_invalid')) && (
//           <Typography variant="body2" sx={{ color: '#C5221F', fontSize: 13, mb: 2 }}>
//             {error}
//           </Typography>
//         )}

//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'flex-end' }}>
//           <Button
//             variant="outlined"
//             onClick={onClose}
//             disabled={submitting}
//             sx={{
//               borderColor: '#E2E8F0',
//               color: '#64748B',
//               borderRadius: 1.5,
//               px: 4,
//               py: 1,
//               fontWeight: 600,
//               fontSize: 14,
//               '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
//             }}
//           >
//             {t('cancel')}
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleSubmit}
//             disabled={submitting}
//             sx={{
//               bgcolor: currentMode ? '#137333' : '#C5221F',
//               color: '#FFFFFF',
//               borderRadius: 1.5,
//               px: 4,
//               py: 1,
//               fontWeight: 600,
//               fontSize: 14,
//               boxShadow: 'none',
//               '&:hover': {
//                 bgcolor: currentMode ? '#0F5F2B' : '#A41E1B',
//               },
//             }}
//           >
//             {submitting ? t('submitting') : t('submit')}
//           </Button>
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }
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
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { reviewCourse } from 'src/actions/courses';
import type { CourseDto } from 'src/types/course';

type ReviewMode = 'accept' | 'reject';

interface ReviewCourseDialogProps {
  open: boolean;
  course: CourseDto | null;
  onClose: () => void;
  onReviewed: () => void;
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
  const [platformPercentage, setPlatformPercentage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode('accept');
      setRejectionReason('');
      setPlatformPercentage('');
      setError('');
      setTouched(false);
    }
  }, [open, course]);

  const percentage = platformPercentage === '' ? NaN : Number(platformPercentage);
  const isPercentageInvalid = !Number.isNaN(percentage) && (percentage < 0 || percentage > 100);

  const platformHint = t('platform_percentage_hint');
  const showPercentageError = touched && platformPercentage !== '' && isPercentageInvalid;

  const handleSubmit = async () => {
    if (!course) return;

    setTouched(true);
    if (mode === 'reject' && !rejectionReason.trim()) {
      setError(t('rejection_reason_required'));
      return;
    }
    if (isPercentageInvalid) {
      setError(t('platform_percentage_invalid'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await reviewCourse(course.id, {
        accept: mode === 'accept',
        rejectionReason: mode === 'reject' ? rejectionReason.trim() : undefined,
        platformPercentage: Number.isNaN(percentage) ? undefined : percentage,
      });
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
              gap: 1, // Solves icon and text collision in RTL
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
              gap: 1, // Solves icon and text collision in RTL
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

        {/* Description or Rejection Reason */}
        {currentMode ? (
          <Typography
            variant="body2"
            sx={{ color: '#475569', fontSize: 14, mb: 3, textAlign: isRtl ? 'right' : 'left' }}
          >
            {t('accept_desc')}
          </Typography>
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

        {/* Platform Percentage Field */}
        {/* <TextField
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
          helperText={error && error !== t('platform_percentage_invalid') ? '' : platformHint}
          error={showPercentageError || error === t('platform_percentage_invalid')}
          dir={isRtl ? 'rtl' : 'ltr'}
          slotProps={{
            htmlInput: { min: 0, max: 100 },
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
            '& .MuiInputBase-input': { textAlign: isRtl ? 'right' : 'left' },
            '& .MuiFormHelperText-root': { textAlign: isRtl ? 'right' : 'left' },
          }}
        /> */}
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
  helperText={error && error !== t('platform_percentage_invalid') ? '' : platformHint}
  error={showPercentageError || error === t('platform_percentage_invalid')}
  slotProps={{
    htmlInput: { min: 0, max: 100 },
  }}
  sx={{
    mb: 3,
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

    /* --- ضبط الـ Label و القطع في الإطار لـ RTL --- */
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
  }}
/>

        {/* Error Message */}
        {error && !error.startsWith(t('platform_percentage_invalid')) && (
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