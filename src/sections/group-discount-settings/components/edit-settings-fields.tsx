'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type Props = {
  minParticipants: string;
  discountPercentage: string;
  touched: boolean;
  onMinParticipantsChange: (value: string) => void;
  onDiscountPercentageChange: (value: string) => void;
};

export default function EditSettingsFields({
  minParticipants,
  discountPercentage,
  touched,
  onMinParticipantsChange,
  onDiscountPercentageChange,
}: Props) {
  const t = useTranslations('GroupDiscountSettings.edit');
  const participantsValid =
    minParticipants.trim() !== '' && Number.isInteger(Number(minParticipants)) && Number(minParticipants) >= 0;
  const percentageValid =
    discountPercentage.trim() !== '' &&
    Number(discountPercentage) >= 0 &&
    Number(discountPercentage) <= 100;

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, boxShadow: 'none' }}>
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
            value={minParticipants}
            onChange={(event) => onMinParticipantsChange(event.target.value)}
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
            value={discountPercentage}
            onChange={(event) => onDiscountPercentageChange(event.target.value)}
            error={touched && !percentageValid}
            helperText={touched && !percentageValid ? t('percentage.error') : t('percentage.helper')}
            slotProps={{
              htmlInput: { min: 0, max: 100 },
              input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}
