'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';

export default function AcademyBankAccountsNotice() {
  const t = useTranslations('AcademyBankAccounts');
  return <Alert severity="info">{t('notice')}</Alert>;
}
