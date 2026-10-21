'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { AcademyBankAccount } from 'src/types/academy-bank-account';

type Props = {
  account: AcademyBankAccount | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export default function DeleteBankAccountDialog({ account, loading, onClose, onConfirm }: Props) {
  const t = useTranslations('AcademyBankAccounts.delete_dialog');
  return (
    <Dialog open={Boolean(account)} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>{t('title')}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, mb: 3 }}>
          {t('message', { bank: account?.bankName || '' })}
        </Typography>
        <Stack direction="row" spacing={1.25}>
          <Button fullWidth variant="contained" color="error" disabled={loading} onClick={() => void onConfirm()}>
            {loading && <CircularProgress size={17} color="inherit" sx={{ mx: 1 }} />}{t('confirm')}
          </Button>
          <Button fullWidth variant="outlined" disabled={loading} onClick={onClose}>{t('cancel')}</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
