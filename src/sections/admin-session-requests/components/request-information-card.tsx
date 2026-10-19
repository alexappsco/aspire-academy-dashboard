'use client';

import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import type { AdminSessionRequest } from 'src/types/admin-session-request';

import {
  formatSessionRequestDate,
  isGroupSessionRequest,
  normalizeSessionRequestType,
} from '../utils';

type Props = { request: AdminSessionRequest };

export default function RequestInformationCard({ request }: Props) {
  const t = useTranslations('AdminSessionRequestDetails');
  const locale = useLocale();
  const serviceType = normalizeSessionRequestType(request.type);
  const isGroup = isGroupSessionRequest(request);

  const items = [
    { label: t('information.request_number'), value: request.requestNumber || '—' },
    { label: t('information.creation_date'), value: formatSessionRequestDate(request.creationTime, locale) },
    { label: t('information.request_kind'), value: t(isGroup ? 'request_kinds.group' : 'request_kinds.individual') },
    { label: t('information.service_type'), value: serviceType ? t(`service_types.${serviceType}`) : '—' },
    { label: t('information.student'), value: request.studentName || '—' },
    { label: t('information.country'), value: request.participants?.find((item) => item.studentId === request.studentId)?.countryName || '—' },
    { label: t('information.instructor'), value: request.assignedInstructorName || '—' },
    { label: t('information.specialization'), value: request.specializationName || '—' },
    { label: t('information.responded_at'), value: request.respondedAt ? formatSessionRequestDate(request.respondedAt, locale) : '—' },
    { label: t('information.admin_reviewed_at'), value: request.adminReviewedAt ? formatSessionRequestDate(request.adminReviewedAt, locale) : '—' },
  ];

  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, boxShadow: 'none' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.25 }}>
        {t('information.title')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.25 }}>
        {items.map((item) => (
          <Box key={item.label}>
            <Typography sx={{ color: '#7B8798', fontSize: 12, mb: 0.5 }}>{item.label}</Typography>
            <Typography sx={{ color: '#1E293B', fontSize: 14, fontWeight: 700 }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
