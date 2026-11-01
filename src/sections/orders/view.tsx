'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { useToast } from 'src/components/toast';
import { resolveReceiptUrl, type OrderDto } from 'src/types/order';

import OrdersFilters from './components/orders-filters';
import OrdersTable from './components/orders-table';
import RejectOrderDialog from './components/reject-order-dialog';
import useOrders from './hooks/use-orders';

export default function OrdersView() {
  const t = useTranslations('StudentOrders');
  const toast = useToast();

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

  return (
    <Box sx={{ py: 2, pb: 6 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500, mt: 0.5 }}>
          {t('subtitle')}
        </Typography>
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
