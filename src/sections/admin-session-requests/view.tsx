'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AdminSessionRequestFilters from './components/requests-filters';
import AdminSessionRequestsTable from './components/requests-table';
import AdminSessionRequestStatusTabs from './components/status-tabs';
import useAdminSessionRequests from './hooks/use-admin-session-requests';

function realtimeLabel(status: string) {
  switch (status) {
    case 'connected':
      return { label: 'Realtime: متصل', color: 'success' as const };
    case 'connecting':
      return { label: 'Realtime: يتصل...', color: 'warning' as const };
    case 'error':
    case 'disconnected':
      return { label: 'Realtime: غير متصل (تحديث دوري)', color: 'default' as const };
    default:
      return { label: 'Realtime: ...', color: 'default' as const };
  }
}

export default function AdminSessionRequestsView() {
  const t = useTranslations('AdminSessionRequests');
  const {
    requests,
    counts,
    totalCount,
    status,
    requestKind,
    type,
    search,
    loading,
    realtimeStatus,
    changeStatus,
    changeRequestKind,
    changeType,
    changeSearch,
  } = useAdminSessionRequests();

  const realtime = realtimeLabel(realtimeStatus);

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t('title')}
        </Typography>
        {/* <Chip size="small" color={realtime.color} label={realtime.label} sx={{ fontWeight: 700 }} /> */}
      </Stack>

      <Card sx={{ borderRadius: 3, border: '1px solid #EEF2F6', boxShadow: 'none' }}>
        <AdminSessionRequestStatusTabs
          value={status}
          counts={counts}
          onChange={changeStatus}
        />
        <AdminSessionRequestFilters
          search={search}
          requestKind={requestKind}
          type={type}
          onSearchChange={changeSearch}
          onRequestKindChange={changeRequestKind}
          onTypeChange={changeType}
        />
        <AdminSessionRequestsTable
          requests={requests}
          totalCount={totalCount}
          loading={loading}
        />
      </Card>
    </Box>
  );
}
