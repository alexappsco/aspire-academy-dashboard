'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { SessionGroupDiscountSetting } from 'src/types/session-group-discount-setting';

type Props = {
  percentage: string;
  touched: boolean;
  isValid: boolean;
  discountSetting: SessionGroupDiscountSetting | null;
  discountLoading: boolean;
  showGroupDiscount: boolean;
  disabled: boolean;
  onPercentageChange: (value: string) => void;
  onBlur: () => void;
};

export default function PlatformPercentageCard({
  percentage,
  touched,
  isValid,
  discountSetting,
  discountLoading,
  showGroupDiscount,
  disabled,
  onPercentageChange,
  onBlur,
}: Props) {
  const t = useTranslations('AdminSessionRequestDetails.review');

  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        {t('title')}
      </Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>
        {t('notice')}
      </Alert>
      <Typography component="label" htmlFor="platform-percentage" sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 700 }}>
        {t('instructor_percentage')}
      </Typography>
      <TextField
        id="platform-percentage"
        type="number"
        size="small"
        fullWidth
        value={percentage}
        disabled={disabled}
        onChange={(event) => onPercentageChange(event.target.value)}
        onBlur={onBlur}
        error={touched && !isValid}
        helperText={touched && !isValid ? t('percentage_error') : t('percentage_helper')}
        slotProps={{
          htmlInput: { min: 0, max: 100 },
          input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
        }}
      />

      <Typography sx={{ color: '#667085', fontSize: 12, mt: 1.25 }}>
        {t('remainder_note')}
      </Typography>

      <Box sx={{ mt: 2, p: 1.5, border: '1px dashed #D7DEE8', borderRadius: 1.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1 }}>
          {t('example.title')}
        </Typography>
        <Typography sx={{ color: '#344054', fontSize: 12, mb: 0.5 }}>
          {t('example.consumption')}
        </Typography>
        <Typography sx={{ color: '#344054', fontSize: 12, mb: 0.5 }}>
          {t('example.instructor')}
        </Typography>
        <Typography sx={{ color: '#344054', fontSize: 12, mb: 0.5 }}>
          {t('example.platform')}
        </Typography>
        <Typography sx={{ color: '#667085', fontSize: 11, mt: 1 }}>
          {t('example.note')}
        </Typography>
      </Box>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#DDF7FC', borderRadius: 1.5 }}>
        <Typography sx={{ color: '#087F9C', fontSize: 13, fontWeight: 800, mb: 0.5 }}>
          {t('unsettled_rule.title')}
        </Typography>
        <Typography sx={{ color: '#087F9C', fontSize: 12 }}>
          {t('unsettled_rule.description')}
        </Typography>
      </Box>

      {showGroupDiscount && <Box sx={{ mt: 2, p: 1.5, border: '1px dashed #D7DEE8', borderRadius: 1.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>
          {t('group_discount.title')}
        </Typography>
        {discountLoading ? (
          <CircularProgress size={18} />
        ) : discountSetting ? (
          <Box sx={{ display: 'grid', gap: 0.5 }}>
            <Typography sx={{ color: '#667085', fontSize: 12 }}>
              {t(discountSetting.isEnabled ? 'group_discount.enabled' : 'group_discount.disabled')}
            </Typography>
            {discountSetting.isEnabled && (
              <>
                <Typography sx={{ color: '#667085', fontSize: 12 }}>
                  {t('group_discount.minimum', { count: discountSetting.minParticipants })}
                </Typography>
                <Typography sx={{ color: '#667085', fontSize: 12 }}>
                  {t('group_discount.percentage', { value: discountSetting.discountPercentage })}
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <Typography sx={{ color: '#667085', fontSize: 12 }}>
            {t('group_discount.unavailable')}
          </Typography>
        )}
      </Box>}

    </Card>
  );
}
