'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import CurrentRuleBanner from './components/current-rule-banner';
import CreateTierDialog from './components/create-tier-dialog';
import DiscountFlowExplanation from './components/discount-flow-explanation';
import DiscountSummary from './components/discount-summary';
import ReadOnlyNotice from './components/read-only-notice';
import GroupDiscountSettingsHeader from './components/settings-header';
import useGroupDiscountSetting from './hooks/use-group-discount-setting';

export default function GroupDiscountSettingsView() {
  const t = useTranslations('GroupDiscountSettings');
  const discountSetting = useGroupDiscountSetting();
  const { setting, loading, error, retry } = discountSetting;
  const [createOpen, setCreateOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!setting) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error" action={<Button onClick={() => void retry()}>{t('retry')}</Button>}>
          {error || t('load_error')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, pb: 6, display: 'grid', gap: 1.5 }}>
      <GroupDiscountSettingsHeader onAdd={() => setCreateOpen(true)} />
      <CurrentRuleBanner isEnabled={setting.isEnabled} />
      <DiscountSummary setting={setting} />
      <DiscountFlowExplanation />
      <ReadOnlyNotice />
      <CreateTierDialog
        open={createOpen}
        saving={discountSetting.creating}
        onClose={() => !discountSetting.creating && setCreateOpen(false)}
        onSave={discountSetting.createTier}
      />
    </Box>
  );
}
