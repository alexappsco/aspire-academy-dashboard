'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

type Props = {
  open: boolean;
  loading: boolean;
  requestNumber?: string | null;
  instructorName?: string | null;
  instructorPercentage: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function ReviewConfirmDialog({
  open,
  loading,
  requestNumber,
  instructorName,
  instructorPercentage,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations('AdminSessionRequestDetails.review.confirm');

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 2.5, p: 1.5 } } }}
    >
      <DialogContent>
        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', mb: 0.5 }}>
          {t('approve_title')}
        </Typography>
        <Typography sx={{ color: '#667085', fontSize: 13, textAlign: 'center', mb: 2 }}>
          {[requestNumber, instructorName].filter(Boolean).join(' - ')}
        </Typography>

        <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 1.5, p: 2, mb: 2, textAlign: 'center' }}>
          <Typography sx={{ color: '#667085', fontSize: 12 }}>
            {t('instructor_percentage')}
          </Typography>
          <Typography sx={{ color: '#059669', fontSize: 22, fontWeight: 800 }}>
            {instructorPercentage}%
          </Typography>
        </Box>

        <Typography sx={{ color: '#9A6700', bgcolor: '#FFF4D6', borderRadius: 1.5, p: 1.5, fontSize: 12, mb: 2 }}>
          {t('approve_warning')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            disabled={loading}
            onClick={() => void onConfirm()}
            sx={{ minHeight: 44, borderRadius: 1.5, fontWeight: 700 }}
          >
            {loading && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}
            {t('approve_submit')}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            disabled={loading}
            onClick={onClose}
            sx={{ minHeight: 44, borderRadius: 1.5, fontWeight: 700 }}
          >
            {t('cancel')}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
