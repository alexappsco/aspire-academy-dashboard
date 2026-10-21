'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

type Props = {
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditSettingsActions({ saving, onSave, onCancel }: Props) {
  const t = useTranslations('GroupDiscountSettings.edit');

  return (
    <Stack direction="row" spacing={1.25}>
      <Button
        variant="contained"
        disabled={saving}
        onClick={onSave}
        sx={{ minWidth: 170, minHeight: 44, bgcolor: '#17243E', borderRadius: 1.5 }}
      >
        {saving && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}
        {t('save')}
      </Button>
      <Button
        variant="outlined"
        disabled={saving}
        onClick={onCancel}
        sx={{ minWidth: 120, minHeight: 44, borderRadius: 1.5 }}
      >
        {t('cancel')}
      </Button>
    </Stack>
  );
}
