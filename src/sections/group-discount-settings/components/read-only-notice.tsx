'use client';

import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';

export default function ReadOnlyNotice() {
  const t = useTranslations('GroupDiscountSettings');
  return <Alert severity="warning">{t('read_only_notice')}</Alert>;
}
