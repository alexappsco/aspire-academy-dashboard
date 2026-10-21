'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import type { AcademyBankAccount } from 'src/types/academy-bank-account';

import AccountDetailItem from './account-detail-item';

type Props = {
  account: AcademyBankAccount;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onVisibilityChange: (isVisible: boolean) => void;
};

export default function BankAccountCard({
  account,
  loading,
  onEdit,
  onDelete,
  onVisibilityChange,
}: Props) {
  const t = useTranslations('AcademyBankAccounts');

  return (
    <Card variant="outlined" sx={{ borderRadius: 2.5, boxShadow: 'none', overflow: 'hidden' }}>
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifySelf: 'start' }}>
          <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#DDF8EF', color: '#168567', display: 'grid', placeItems: 'center' }}>
            <SvgColor src="/icons/bank.svg" sx={{ width: 23, height: 23 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{account.bankName}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Chip size="small" label={`${account.countryName} · ${account.currencyCode}`} />
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifySelf: 'end' }}>
          {loading && <CircularProgress size={18} />}
          <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{t('visible_to_students')}</Typography>
          <Switch
            checked={account.isVisibleToStudents}
            disabled={loading}
            onChange={(event) => onVisibilityChange(event.target.checked)}
            slotProps={{ input: { 'aria-label': t('visible_to_students') } }}
          />
          <IconButton disabled={loading} onClick={onEdit} aria-label={t('edit')}>
            <Iconify icon="solar:pen-linear" width={20} />
          </IconButton>
          <IconButton disabled={loading} onClick={onDelete} color="error" aria-label={t('delete')}>
            <Iconify icon="solar:trash-bin-trash-linear" width={20} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        <AccountDetailItem label={t('fields.account_holder')} value={account.accountHolderName} />
        <AccountDetailItem label={t('fields.account_number')} value={account.accountNumber} ltr />
        <AccountDetailItem label={t('fields.currency')} value={`${account.currencyName} (${account.currencyCode})`} />
        <AccountDetailItem label={t('fields.iban')} value={account.iban} ltr />
        <AccountDetailItem label={t('fields.swift')} value={account.swiftCode} ltr />
      </Box>

      {account.studentInstructions && (
        <Typography sx={{ mx: 2, mb: 2, p: 1.25, borderRadius: 1.5, bgcolor: '#F8FAFC', color: 'text.secondary', fontSize: 12 }}>
          {t('fields.instructions')}: {account.studentInstructions}
        </Typography>
      )}
    </Card>
  );
}
