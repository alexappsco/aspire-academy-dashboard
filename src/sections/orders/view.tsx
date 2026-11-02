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
import { resolveReceiptUrl, type OrderDto } from 'src/types/order';
import { exportApprovedOrdersPdfAction } from 'src/actions/orders';

import OrdersFilters from './components/orders-filters';
import OrdersTable from './components/orders-table';
import RejectOrderDialog from './components/reject-order-dialog';
import useOrders from './hooks/use-orders';

export default function OrdersView() {
  const t = useTranslations('StudentOrders');
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const {
    orders,
    totalCount,
    status,
    search,
    loading,
    actionLoadingId,
    rejectTarget,
    rejectReason,
    setRejectReason,
    rejectLoading,
    changeStatus,
    changeSearch,
    handleApprove,
    handleReject,
    openRejectDialog,
    closeRejectDialog,
  } = useOrders();

  const handleViewReceipt = (order: OrderDto) => {
    const url = resolveReceiptUrl(order.receiptUrl);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast.info(t('messages.no_receipt'));
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const res = await exportApprovedOrdersPdfAction();
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
        link.download = res.data.fileName || 'approved-orders.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success(t('messages.export_success'));
      } else {
        toast.error(res.error || t('messages.export_error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('messages.export_error'));
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>

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
        <OrdersFilters
          search={search}
          status={status}
          onSearchChange={changeSearch}
          onStatusChange={changeStatus}
        />

        <OrdersTable
          orders={orders}
          totalCount={totalCount}
          loading={loading}
          actionLoadingId={actionLoadingId}
          onViewReceipt={handleViewReceipt}
          onApprove={(order) => handleApprove(order.id)}
          onReject={openRejectDialog}
        />
      </Card>

      <RejectOrderDialog
        order={rejectTarget}
        reason={rejectReason}
        loading={rejectLoading}
        onReasonChange={setRejectReason}
        onClose={closeRejectDialog}
        onConfirm={handleReject}
      />
    </Box>
  );
}
