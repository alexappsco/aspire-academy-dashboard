'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { OrderDto } from 'src/types/order';

type Props = {
  order: OrderDto | null;
  reason: string;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RejectOrderDialog({
  order,
  reason,
  loading,
  onReasonChange,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations('StudentOrders');

  return (
    <Dialog
      open={Boolean(order)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', fontSize: 17, pb: 0.5 }}>
        {t('reject_dialog.title')}
      </DialogTitle>
      <DialogContent sx={{ pt: '4px !important' }}>
        {order && (
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, mb: 1.5 }}>
            {t('reject_dialog.order_label', {
              number: `#ORD-${order.id.slice(0, 8).toUpperCase()}`,
              student: order.buyerName || '-',
            })}
          </Typography>
        )}
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label={t('reject_dialog.reason_label')}
          placeholder={t('reject_dialog.reason_placeholder')}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ borderRadius: 2, color: '#475569', borderColor: '#E2E8F0', fontWeight: 600 }}
        >
          {t('reject_dialog.cancel')}
        </Button>
        <Button
          variant="contained"
          disabled={!reason.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          onClick={onConfirm}
          sx={{
            bgcolor: '#E11D48',
            color: '#FFFFFF',
            borderRadius: 2,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#BE123C' },
          }}
        >
          {t('reject_dialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
