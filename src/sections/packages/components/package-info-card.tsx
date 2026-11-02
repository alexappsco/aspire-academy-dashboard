'use client';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

type Props = {
  nameAr: string;
  nameEn: string;
  errors: Record<string, string>;
  onChange: (field: 'nameAr' | 'nameEn', value: string) => void;
};

export default function PackageInfoCard({ nameAr, nameEn, errors, onChange }: Props) {
  const t = useTranslations('Packages.form.info');
  const labelSx = {
    direction: 'rtl',
    '& .MuiInputLabel-root': { left: 'auto', right: 14, transformOrigin: 'top right' },
    '& .MuiInputLabel-shrink': { transform: 'translate(0, -9px) scale(0.75)' },
    '& .MuiOutlinedInput-notchedOutline': { textAlign: 'right' },
    '& .MuiOutlinedInput-notchedOutline legend': {
      marginLeft: 'auto',
      marginRight: 0,
    },
  };
  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6">{t('title')}</Typography>
      <Divider sx={{ my: 2 }} />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField fullWidth required label={t('name_ar')} value={nameAr} onChange={(e) => onChange('nameAr', e.target.value)} error={!!errors.nameAr} helperText={errors.nameAr} sx={labelSx} />
        <TextField fullWidth required label={t('name_en')} value={nameEn} onChange={(e) => onChange('nameEn', e.target.value)} error={!!errors.nameEn} helperText={errors.nameEn} sx={labelSx} inputProps={{ dir: 'ltr' }} />
      </Stack>
    </Card>
  );
}
