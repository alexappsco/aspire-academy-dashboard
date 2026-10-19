'use client';

import { useTranslations } from 'next-intl';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type Props = { description?: string | null };

export default function RequestDescriptionCard({ description }: Props) {
  const t = useTranslations('AdminSessionRequestDetails.description');

  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        {t('title')}
      </Typography>
      <Typography
        sx={{ bgcolor: '#F8FAFC', borderRadius: 1.5, color: '#344054', fontSize: 14, p: 2 }}
      >
        {description?.trim() || t('empty')}
      </Typography>
    </Card>
  );
}
