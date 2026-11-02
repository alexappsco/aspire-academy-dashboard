'use client';

import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

type Props = {
  coursesTotal: number;
  selectedCount: number;
  finalPrice: string;
  isActive: boolean;
  currency: string;
  errors: Record<string, string>;
  onFinalPriceChange: (value: string) => void;
  onActiveChange: (value: boolean) => void;
};

export default function PackagePricingCard(props: Props) {
  const t = useTranslations('Packages.form.pricing');
  const finalPrice = Number(props.finalPrice) || 0;
  const discountPercentage = props.coursesTotal > 0
    ? Math.max(0, ((props.coursesTotal - finalPrice) / props.coursesTotal) * 100)
    : 0;

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6">{t('title')}</Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: 'block', marginBottom: '48px !important' }}
      >
        {t('subtitle')}
      </Typography>
      <Stack spacing={2.25}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          <Typography color="text.secondary">{t('selected_count')}</Typography>
          <Typography fontWeight={700}>{t('selected_count_value', { count: props.selectedCount })}</Typography>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          <Typography color="text.secondary">{t('courses_total')}</Typography>
          <Typography fontWeight={700}>{props.coursesTotal.toFixed(2)} {props.currency}</Typography>
        </Box>
        <TextField
          fullWidth
          required
          type="number"
          label={t('final_price')}
          value={props.finalPrice}
          onChange={(event) => props.onFinalPriceChange(event.target.value)}
          error={!!props.errors.discountedPrice}
          helperText={props.errors.discountedPrice}
          slotProps={{ input: { endAdornment: <Typography color="text.secondary">{props.currency}</Typography> } }}
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', fontWeight: 700, fontSize: 18 },
            '& .MuiInputLabel-root': { left: 'auto', right: 14, transformOrigin: 'top right' },
            '& .MuiInputLabel-shrink': { transform: 'translate(0, -9px) scale(0.75)' },
            '& .MuiOutlinedInput-notchedOutline': { textAlign: 'right' },
            '& .MuiOutlinedInput-notchedOutline legend': { marginLeft: 'auto', marginRight: 0 },
          }}
        />
        <Alert severity="info">
          {t('discount_rate', { value: discountPercentage.toFixed(2) })}
        </Alert>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={600}>{t('status')}</Typography>
          <FormControlLabel control={<Switch checked={props.isActive} onChange={(event) => props.onActiveChange(event.target.checked)} />} label={t('active')} />
        </Stack>
      </Stack>
    </Card>
  );
}
