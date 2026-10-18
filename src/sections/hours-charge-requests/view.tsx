'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import HoursChargeRequestFilters from './components/requests-filters';
import HoursChargeRequestsTable from './components/requests-table';
import HoursChargeRequestStatusTabs from './components/status-tabs';
import useHoursChargeRequests from './hooks/use-hours-charge-requests';

export default function HoursChargeRequestsView() {
  const t = useTranslations('HoursChargeRequests');
  const {
    requests,
    counts,
    countries,
    totalCount,
    status,
    countryId,
    fromDate,
    search,
    loading,
    changeStatus,
    changeCountry,
    changeDate,
    changeSearch,
  } = useHoursChargeRequests();

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2.5 }}>
        {t('title')}
      </Typography>

      <Card sx={{ borderRadius: 3, border: '1px solid #EEF2F6', boxShadow: 'none' }}>
        <HoursChargeRequestStatusTabs
          value={status}
          counts={counts}
          onChange={changeStatus}
        />

        <HoursChargeRequestFilters
          search={search}
          fromDate={fromDate}
          countryId={countryId}
          status={status}
          countries={countries}
          onSearchChange={changeSearch}
          onDateChange={changeDate}
          onCountryChange={changeCountry}
          onStatusChange={changeStatus}
        />

        <HoursChargeRequestsTable
          requests={requests}
          totalCount={totalCount}
          loading={loading}
        />
      </Card>
    </Box>
  );
}