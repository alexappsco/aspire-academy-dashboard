'use client';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import MediaUploadBox from 'src/sections/courses/components/MediaUploadBox';

type Props = { value: File | string | null; error?: string; readOnly?: boolean; onChange: (file: File | null) => void };

export default function PackageImageCard({ value, error, readOnly, onChange }: Props) {
  const t = useTranslations('Packages.form.image');
  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{t('title')}</Typography>
      {readOnly ? (
        <Box component="img" src={typeof value === 'string' ? value : ''} alt={t('label')} sx={{ display: 'block', width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 2, bgcolor: '#F8FAFC' }} />
      ) : (
        <MediaUploadBox label={t('label')} recommendedSize={t('hint')} iconName="solar:gallery-add-bold" value={value} onChange={onChange} required />
      )}
      {error && <Typography variant="caption" color="error" sx={{ mt: 1 }}>{error}</Typography>}
    </Card>
  );
}
