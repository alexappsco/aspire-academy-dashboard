'use client';

import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type Props = {
  canSubmit: boolean;
  percentageValid: boolean;
  onApprove: () => void;
};

export default function RequestDecisionCard({
  canSubmit,
  percentageValid,
  onApprove,
}: Props) {
  const t = useTranslations('AdminSessionRequestDetails.decision');

  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
        {t('title')}
      </Typography>
      <Button
        fullWidth
        variant="contained"
        disabled={!canSubmit || !percentageValid}
        onClick={onApprove}
        sx={{ minHeight: 50, borderRadius: 1.5, bgcolor: '#17243E', fontWeight: 700, '&:hover': { bgcolor: '#223354' } }}
      >
        {t('approve')}
      </Button>
      <Typography sx={{ color: '#667085', fontSize: 11, lineHeight: 1.7, mt: 1.5 }}>
        {t('approve_note')}
      </Typography>
    </Card>
  );
}
