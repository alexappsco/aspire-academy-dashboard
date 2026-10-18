'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

type Props = {
  approving: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export default function HoursChargeRequestActions({ approving, onApprove, onReject }: Props) {
  const t = useTranslations('HoursChargeRequestActions.actions');

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start', bgcolor: '#fff', p: 1.25 }}>
      <Button
        variant="contained"
        disabled={approving}
        onClick={onApprove}
        sx={{ minWidth: 225, minHeight: 48, borderRadius: 1.5, bgcolor: '#17243E', fontWeight: 700, '&:hover': { bgcolor: '#223354' } }}
      >
        {approving && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}
        {t('approve')}
      </Button>
      <Button
        variant="contained"
        color="error"
        disabled={approving}
        onClick={onReject}
        sx={{ minWidth: 140, minHeight: 48, borderRadius: 1.5, fontWeight: 700 }}
      >
        {t('reject')}
      </Button>
    </Box>
  );
}
