'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

type Props = { onAdd: () => void };

export default function AcademyBankAccountsHeader({ onAdd }: Props) {
  const t = useTranslations('AcademyBankAccounts');

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>{t('title')}</Typography>
      <Button
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" width={20} />}
        onClick={onAdd}
        sx={{ minWidth: 165, minHeight: 42, borderRadius: 1.5, bgcolor: '#17243E' }}
      >
        {t('add_account')}
      </Button>
    </Stack>
  );
}
