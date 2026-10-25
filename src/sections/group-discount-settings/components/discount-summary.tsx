'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { SessionGroupDiscountSetting } from 'src/types/session-group-discount-setting';

import SettingSummaryCard from './setting-summary-card';

type Props = { setting: SessionGroupDiscountSetting };

export default function DiscountSummary({ setting }: Props) {
  const t = useTranslations('GroupDiscountSettings');

  if (setting.tiers.length === 0) {
    return (
      <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{t('tiers.empty')}</Typography>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {setting.tiers.map((tier, index) => {
        const discountedHours = Math.max(
          0,
          10 * (1 - tier.discountPercentage / 100)
        ).toFixed(2);

        return (
          <Box key={tier.id} sx={{ display: 'grid', gap: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>
              {t('tiers.item', { number: index + 1 })}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <SettingSummaryCard
                title={t('minimum.title')}
                value={t('minimum.value', { count: tier.minParticipants })}
                description={t('minimum.description', { friends: Math.max(0, tier.minParticipants - 1) })}
                example={t('minimum.example', { count: tier.minParticipants })}
              />
              <SettingSummaryCard
                title={t('percentage.title')}
                value={`${tier.discountPercentage}%`}
                valueColor="#2563D9"
                description={t('percentage.description')}
                example={t('percentage.example', { hours: discountedHours })}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
