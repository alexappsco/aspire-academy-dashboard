'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  value: string;
  description: string;
  example: string;
  valueColor?: string;
};

export default function SettingSummaryCard({
  title,
  value,
  description,
  example,
  valueColor = '#17243E',
}: Props) {
  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography sx={{ color: valueColor, fontSize: 30, fontWeight: 800, my: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>{description}</Typography>
      <Typography
        sx={{ mt: 1.5, p: 1, borderRadius: 1.5, bgcolor: '#EFF7FF', color: '#2563D9', fontSize: 12 }}
      >
        {example}
      </Typography>
    </Card>
  );
}
