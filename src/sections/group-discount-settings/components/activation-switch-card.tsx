'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ActivationSwitchCard({ checked, onChange }: Props) {
  const t = useTranslations('GroupDiscountSettings.edit');

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 800 }}>{t('activation.title')}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5 }}>
          {t('activation.description')}
        </Typography>
      </Box>
      <Switch
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        inputProps={{ 'aria-label': t('activation.title') }}
      />
    </Card>
  );
}
