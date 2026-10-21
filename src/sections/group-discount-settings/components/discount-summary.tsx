'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';

import type { SessionGroupDiscountSetting } from 'src/types/session-group-discount-setting';

import SettingSummaryCard from './setting-summary-card';

type Props = { setting: SessionGroupDiscountSetting };

export default function DiscountSummary({ setting }: Props) {
  const t = useTranslations('GroupDiscountSettings');
  const discountedHours = Math.max(0, 10 * (1 - setting.discountPercentage / 100));

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
      <SettingSummaryCard
        title={t('minimum.title')}
        value={t('minimum.value', { count: setting.minParticipants })}
        description={t('minimum.description', { friends: Math.max(0, setting.minParticipants - 1) })}
        example={t('minimum.example', { count: setting.minParticipants })}
      />
      <SettingSummaryCard
        title={t('percentage.title')}
        value={`${setting.discountPercentage}%`}
        valueColor="#2563D9"
        description={t('percentage.description')}
        example={t('percentage.example', { hours: discountedHours })}
      />
    </Box>
  );
}
