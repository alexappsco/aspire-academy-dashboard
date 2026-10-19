'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

type Props = {
  receiptUrl: string;
};

function resolveReceiptUrl(rawUrl: string): string {
  const value = rawUrl.trim();
  if (!value) return '';

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  const apiBase = process.env.NEXT_PUBLIC_HOST_API || '';
  let host = apiBase.endsWith('/api/v1') ? apiBase.slice(0, -7) : apiBase;
  let relativePath = value;

  while (host.endsWith('/')) host = host.slice(0, -1);
  while (relativePath.startsWith('/')) relativePath = relativePath.slice(1);

  return host + '/' + relativePath;
}

function getFileName(url: string): string {
  if (!url) return '';
  const cleanUrl = url.split('?')[0];
  return decodeURIComponent(cleanUrl.split('/').pop() || '');
}

export default function ReceiptPreview({ receiptUrl: rawReceiptUrl }: Props) {
  const t = useTranslations('HoursChargeRequests.details.receipt');
  const receiptUrl = useMemo(() => resolveReceiptUrl(rawReceiptUrl), [rawReceiptUrl]);
  const fileName = useMemo(() => getFileName(receiptUrl), [receiptUrl]);
  const [loading, setLoading] = useState(Boolean(receiptUrl));
  const [hasError, setHasError] = useState(false);

  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {t('title')}
      </Typography>
      <Typography sx={{ mt: 0.5, color: '#64748B', fontSize: 12 }}>
        {t('subtitle')}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          mt: 2,
          minHeight: 260,
          maxHeight: 520,
          display: 'grid',
          placeItems: 'center',
          overflow: 'auto',
          border: '1px solid #DCE4EE',
          borderRadius: 2,
          bgcolor: '#F8FAFC',
        }}
      >
        {loading && (
          <CircularProgress size={32} sx={{ position: 'absolute' }} />
        )}

        {receiptUrl && !hasError ? (
          <Box
            component="img"
            src={receiptUrl}
            alt={t('image_alt')}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setHasError(true);
            }}
            sx={{ display: loading ? 'none' : 'block', maxWidth: '100%', maxHeight: 500 }}
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', color: '#64748B' }}>
            <Iconify icon="solar:gallery-broken" width={42} />
            <Typography sx={{ mt: 1, fontWeight: 700 }}>
              {hasError ? t('load_error') : t('empty')}
            </Typography>
          </Box>
        )}
      </Box>

      {receiptUrl && (
        <Button
          fullWidth
          component="a"
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<Iconify icon="solar:paperclip-linear" width={18} />}
          sx={{
            mt: 1.5,
            justifyContent: 'space-between',
            bgcolor: '#EAF1FF',
            color: '#2563EB',
            textTransform: 'none',
          }}
        >
          {fileName || t('attachment')}
        </Button>
      )}
    </Box>
  );
}