'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

const STEPS = ['count', 'wallet', 'apply'] as const;

export default function DiscountFlowExplanation() {
  const t = useTranslations('GroupDiscountSettings');

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
        {t('how_it_works.title')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1 }}>
        {STEPS.map((step, index) => (
          <Box key={step} sx={{ bgcolor: '#F8FAFC', borderRadius: 1.5, p: 1.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 0.75 }}>
              {t(`how_it_works.steps.${step}.title`, { number: index + 1 })}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>
              {t(`how_it_works.steps.${step}.description`)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
