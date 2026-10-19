'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { AdminSessionRequest } from 'src/types/admin-session-request';

import { STATUS_STYLES } from '../constants';
import { normalizeSessionRequestStatus } from '../utils';

type Props = {
  request: AdminSessionRequest;
};

export default function AdminSessionRequestDetailsHeader({ request }: Props) {
  const t = useTranslations('AdminSessionRequestDetails');
  const status = normalizeSessionRequestStatus(request.status);
  const style = status
    ? STATUS_STYLES[status]
    : { backgroundColor: '#F1F5F9', color: '#64748B' };
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t('title')}
          {request.requestNumber ? ` ${request.requestNumber}` : ''}
        </Typography>
        <Box
          component="span"
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            bgcolor: style.backgroundColor,
            color: style.color,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {status ? t(`statuses.${status}`) : t('statuses.unknown')}
        </Box>
      </Box>

      <Button
        variant="outlined"
        onClick={() => router.push(paths.adminSessionRequests.root)}
        sx={{ borderColor: '#D7DEE8', color: '#1E293B', borderRadius: 1.5, fontWeight: 700 }}
      >
        {t('back')}
      </Button>
    </Box>
  );
}
