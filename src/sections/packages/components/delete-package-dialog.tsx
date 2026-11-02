'use client';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslations } from 'next-intl';

type Props = { open: boolean; loading: boolean; name: string; onClose: () => void; onConfirm: () => void };

export default function DeletePackageDialog({ open, loading, name, onClose, onConfirm }: Props) {
  const t = useTranslations('Packages.delete_dialog');
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent><DialogContentText>{t('message', { name })}</DialogContentText></DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button color="inherit" onClick={onClose} disabled={loading}>{t('cancel')}</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>{t('confirm')}</Button>
      </DialogActions>
    </Dialog>
  );
}
