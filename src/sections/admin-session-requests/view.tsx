'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import AdminSessionRequestFilters from './components/requests-filters';
import AdminSessionRequestsTable from './components/requests-table';
import AdminSessionRequestStatusTabs from './components/status-tabs';
import useAdminSessionRequests from './hooks/use-admin-session-requests';

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
    changeStatus,
    changeRequestKind,
    changeType,
    changeSearch,
  } = useAdminSessionRequests();

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2.5 }}>
        {t('title')}
      </Typography>

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
