'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { EditableDiscountTier } from '../hooks/use-edit-group-discount-setting';

type Props = {
  tiers: EditableDiscountTier[];
  touched: boolean;
  onTierChange: (
    index: number,
    field: 'minParticipants' | 'discountPercentage',
    value: string
  ) => void;
};

export default function EditSettingsFields({
  tiers,
  touched,
  onTierChange,
}: Props) {
  const t = useTranslations('GroupDiscountSettings.edit');

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>{t('tiers.title')}</Typography>

      {tiers.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{t('tiers.empty')}</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {tiers.map((tier, index) => {
            const participantsValid =
              tier.minParticipants.trim() !== '' &&
              Number.isInteger(Number(tier.minParticipants)) &&
              Number(tier.minParticipants) >= 0;
            const percentageValid =
              tier.discountPercentage.trim() !== '' &&
              Number(tier.discountPercentage) >= 0 &&
              Number(tier.discountPercentage) <= 100;

            return (
              <Box key={tier.id} sx={{ display: 'grid', gap: 1 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  {t('tiers.item', { number: index + 1 })}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('minimum.title')}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5, mb: 2 }}>
                      {t('minimum.description')}
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('minimum.label')}
                      value={tier.minParticipants}
                      onChange={(event) => onTierChange(index, 'minParticipants', event.target.value)}
                      error={touched && !participantsValid}
                      helperText={touched && !participantsValid ? t('minimum.error') : t('minimum.helper')}
                      slotProps={{ htmlInput: { min: 0, step: 1 } }}
                    />
                  </Box>
                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('percentage.title')}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5, mb: 2 }}>
                      {t('percentage.description')}
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label={t('percentage.label')}
                      value={tier.discountPercentage}
                      onChange={(event) => onTierChange(index, 'discountPercentage', event.target.value)}
                      error={touched && !percentageValid}
                      helperText={touched && !percentageValid ? t('percentage.error') : t('percentage.helper')}
                      slotProps={{
                        htmlInput: { min: 0, max: 100 },
                        input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}
