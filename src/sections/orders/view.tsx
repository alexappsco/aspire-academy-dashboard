'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
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
    selectedIds,
    bulkLoading,
    bulkRejectOpen,
    bulkRejectReason,
    setBulkRejectReason,
    bulkDeleteOpen,
    selectAll,
    selectOne,
    handleBulkApprove,
    openBulkReject,
    closeBulkReject,
    handleConfirmBulkReject,
    openBulkDelete,
    closeBulkDelete,
    handleConfirmBulkDelete,
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

        {selectedIds.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              px: 2,
              pb: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', minWidth: 88 }}>
              {t('bulk.selected', { count: selectedIds.length })}
            </Typography>
            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
            <Button
              variant="contained"
              disabled={Boolean(bulkLoading)}
              onClick={handleBulkApprove}
              startIcon={
                bulkLoading === 'approve' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="eva:checkmark-fill" width={16} />
                )
              }
              sx={{
                borderRadius: 2,
                bgcolor: '#10B981',
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.75,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              {bulkLoading === 'approve'
                ? t('bulk.working')
                : t('bulk.approve', { count: selectedIds.length })}
            </Button>
            <Button
              variant="outlined"
              disabled={Boolean(bulkLoading)}
              onClick={openBulkReject}
              startIcon={<Iconify icon="eva:close-fill" width={16} />}
              sx={{
                borderRadius: 2,
                color: '#E11D48',
                borderColor: '#FECDD3',
                bgcolor: '#FFF1F2',
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.75,
                '&:hover': { borderColor: '#FB7185', bgcolor: '#FFE4E6' },
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              {t('bulk.reject', { count: selectedIds.length })}
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={Boolean(bulkLoading)}
              onClick={openBulkDelete}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
              sx={{
                borderRadius: 2,
                bgcolor: '#DC2626',
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.75,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              {t('bulk.delete', { count: selectedIds.length })}
            </Button>
          </Stack>
        )}

        <OrdersTable
          orders={orders}
          totalCount={totalCount}
          loading={loading}
          actionLoadingId={actionLoadingId}
          selectedIds={selectedIds}
          onSelectAll={selectAll}
          onSelectOne={selectOne}
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

      <Dialog
        open={bulkRejectOpen}
        onClose={closeBulkReject}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A', pb: 0.5 }}>
          {t('bulk.reject_title')}
        </DialogTitle>
        <DialogContent sx={{ pt: '4px !important' }}>
          <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, mb: 1.5 }}>
            {t('bulk.reject_content', { count: selectedIds.length })}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label={t('reject_dialog.reason_label')}
            placeholder={t('reject_dialog.reason_placeholder')}
            value={bulkRejectReason}
            onChange={(event) => setBulkRejectReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={closeBulkReject}
            disabled={bulkLoading === 'reject'}
            sx={{ borderRadius: 2, color: '#475569', borderColor: '#E2E8F0', fontWeight: 600, textTransform: 'none' }}
          >
            {t('bulk.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={!bulkRejectReason.trim() || bulkLoading === 'reject'}
            onClick={handleConfirmBulkReject}
            startIcon={
              bulkLoading === 'reject' ? <CircularProgress size={16} color="inherit" /> : undefined
            }
            sx={{
              bgcolor: '#E11D48',
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#BE123C', boxShadow: 'none' },
            }}
          >
            {t('bulk.confirm_reject')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkDeleteOpen}
        onClose={closeBulkDelete}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A', pb: 1 }}>
          {t('bulk.delete_title')}
        </DialogTitle>
        <DialogContent sx={{ color: '#64748B', fontSize: 14 }}>
          {t('bulk.delete_content', { count: selectedIds.length })}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={closeBulkDelete}
            disabled={bulkLoading === 'delete'}
            sx={{ borderRadius: 2, color: '#64748B', borderColor: '#E2E8F0', fontWeight: 600, textTransform: 'none' }}
          >
            {t('bulk.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmBulkDelete}
            disabled={bulkLoading === 'delete'}
            startIcon={
              bulkLoading === 'delete' ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
              )
            }
            sx={{
              borderRadius: 2,
              bgcolor: '#DC2626',
              fontWeight: 700,
              textTransform: 'none',
              gap: 0.75,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
              '& .MuiButton-startIcon': { m: 0 },
            }}
          >
            {bulkLoading === 'delete' ? t('bulk.deleting') : t('bulk.confirm_delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
