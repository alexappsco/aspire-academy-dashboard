'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import ActivationSwitchCard from './components/activation-switch-card';
import EditSettingsActions from './components/edit-settings-actions';
import EditSettingsFields from './components/edit-settings-fields';
import EditGroupDiscountSettingsHeader from './components/edit-settings-header';
import useEditGroupDiscountSetting from './hooks/use-edit-group-discount-setting';

export default function EditGroupDiscountSettingsView() {
  const t = useTranslations('GroupDiscountSettings.edit');
  const form = useEditGroupDiscountSetting();

  if (form.loading) {
    return (
      <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (form.error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error" action={<Button onClick={() => void form.retry()}>{t('retry')}</Button>}>
          {form.error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6, display: 'grid', gap: 1.5 }}>
      <EditGroupDiscountSettingsHeader />
      <EditSettingsFields
        tiers={form.tiers}
        touched={form.touched}
        onTierChange={form.updateTier}
      />
      <ActivationSwitchCard checked={form.isEnabled} onChange={form.setIsEnabled} />
      <EditSettingsActions saving={form.saving} onSave={() => void form.save()} onCancel={form.cancel} />
    </Box>
  );
}
