'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';
import type { AdminSessionRequest } from 'src/types/admin-session-request';

import { STATUS_STYLES } from '../constants';
import type { AdminSessionRequestRow } from '../types';
import {
  formatSessionRequestDate,
  isGroupSessionRequest,
  normalizeSessionRequestStatus,
  normalizeSessionRequestType,
  toSessionRequestRow,
} from '../utils';

type Props = {
  requests: AdminSessionRequest[];
  totalCount: number;
  loading: boolean;
};

export default function AdminSessionRequestsTable({ requests, totalCount, loading }: Props) {
  const t = useTranslations('AdminSessionRequests');
  const locale = useLocale();
  const router = useRouter();
  const rows = useMemo(() => requests.map(toSessionRequestRow), [requests]);

  const tableHead = [
    { id: 'requestNumberValue', label: t('columns.request_number'), align: cellAlignment.center },
    { id: 'studentValue', label: t('columns.student'), align: cellAlignment.center },
    { id: 'requestKindValue', label: t('columns.request_kind'), align: cellAlignment.center },
    { id: 'participantsValue', label: t('columns.participants'), align: cellAlignment.center },
    { id: 'instructorValue', label: t('columns.instructor'), align: cellAlignment.center },
    { id: 'serviceTypeValue', label: t('columns.service_type'), align: cellAlignment.center },
    { id: 'creationDateValue', label: t('columns.creation_date'), align: cellAlignment.center },
    { id: 'statusValue', label: t('columns.status'), align: cellAlignment.center },
    {
      id: 'instructorPercentageValue',
      label: t('columns.instructor_percentage'),
      align: cellAlignment.center,
    },
  ];

  const text = (value: string, bold = false) => (
    <Typography sx={{ fontSize: 13, fontWeight: bold ? 700 : 400 }}>{value || '—'}</Typography>
  );

  const customRender = {
    requestNumberValue: (row: AdminSessionRequestRow) => text(row.requestNumberValue, true),
    studentValue: (row: AdminSessionRequestRow) => text(row.studentName || '—', true),
    requestKindValue: (row: AdminSessionRequestRow) =>
      text(isGroupSessionRequest(row) ? t('request_kinds.group') : t('request_kinds.individual')),
    participantsValue: (row: AdminSessionRequestRow) =>
      text(row.participants?.length ? String(row.participants.length) : '—'),
    instructorValue: (row: AdminSessionRequestRow) => text(row.assignedInstructorName || '—'),
    serviceTypeValue: (row: AdminSessionRequestRow) => {
      const type = normalizeSessionRequestType(row.type);
      return text(type ? t(`service_types.${type}`) : t('service_types.unknown'));
    },
    creationDateValue: (row: AdminSessionRequestRow) =>
      text(formatSessionRequestDate(row.creationTime, locale)),
    statusValue: (row: AdminSessionRequestRow) => {
      const status = normalizeSessionRequestStatus(row.status);
      const style = status
        ? STATUS_STYLES[status]
        : { backgroundColor: '#F1F5F9', color: '#64748B' };
      return (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
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
      );
    },
    instructorPercentageValue: (row: AdminSessionRequestRow) => {
      if (row.platformPercentage === null || row.platformPercentage === undefined) {
        return text(t('percentage.not_set'));
      }
      return text(`${100 - row.platformPercentage}%`);
    },
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 220 }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(255,255,255,0.72)',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}

      <SharedTable
        data={rows}
        tableHead={tableHead}
        customRender={customRender}
        actions={[
          {
            label: t('actions.view_details'),
            icon: <Iconify icon="solar:eye-linear" width={20} />,
            onClick: (row) => router.push(paths.adminSessionRequests.details(row.id)),
          },
        ]}
        count={totalCount}
        serverPagination
      />
    </Box>
  );
}
