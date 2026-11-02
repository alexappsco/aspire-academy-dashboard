'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { exportApprovedHoursChargeRequestsPdfAction } from 'src/actions/hours-charge-requests';

import HoursChargeRequestFilters from './components/requests-filters';
import HoursChargeRequestsTable from './components/requests-table';
import HoursChargeRequestStatusTabs from './components/status-tabs';
import useHoursChargeRequests from './hooks/use-hours-charge-requests';

export default function HoursChargeRequestsView() {
  const t = useTranslations('HoursChargeRequests');
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const res = await exportApprovedHoursChargeRequestsPdfAction();
      if (res.success && res.data?.base64) {
        const byteCharacters = atob(res.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i += 1) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = res.data.fileName || 'approved-wallet-charge-requests.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success(t('export_success'));
      } else {
        toast.error(res.error || t('export_error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('export_error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleExportPdf}
          disabled={isExporting}
          startIcon={
            isExporting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="solar:export-bold" width={20} />
            )
          }
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            gap: 1,
            '& .MuiButton-startIcon': {
              margin: '0 !important',
              marginInlineEnd: '8px !important',
            },
            '&:hover': { bgcolor: '#2C353E' },
            '&.Mui-disabled': {
              bgcolor: '#919EAB',
              color: '#FFFFFF',
              opacity: 0.8,
            },
          }}
        >
          {isExporting ? t('exporting_pdf') : t('export_pdf')}
        </Button>
      </Box>

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
