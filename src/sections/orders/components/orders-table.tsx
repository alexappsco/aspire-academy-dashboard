'use client';

import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import {
  isCancelledOrder,
  isPaidOrder,
  isPendingOrder,
  type OrderDto,
} from 'src/types/order';

type OrderRow = OrderDto & { checkbox?: string };

type Props = {
  orders: OrderDto[];
  totalCount: number;
  loading: boolean;
  actionLoadingId: string | null;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string) => void;
  onViewReceipt: (order: OrderDto) => void;
  onApprove: (order: OrderDto) => void;
  onReject: (order: OrderDto) => void;
};

export default function OrdersTable({
  orders,
  totalCount,
  loading,
  actionLoadingId,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewReceipt,
  onApprove,
  onReject,
}: Props) {
  const t = useTranslations('StudentOrders');
  const locale = useLocale();

  const getStatusInfo = (status: unknown) => {
    if (isPendingOrder(status)) {
      return {
        label: t('statuses.pending'),
        color: '#B45309',
        bgcolor: '#FEF3C7',
        isPending: true,
      };
    }
    if (isPaidOrder(status)) {
      return {
        label: t('statuses.paid'),
        color: '#065F46',
        bgcolor: '#D1FAE5',
        isPending: false,
      };
    }
    if (isCancelledOrder(status)) {
      return {
        label: t('statuses.cancelled'),
        color: '#991B1B',
        bgcolor: '#FEE2E2',
        isPending: false,
      };
    }
    return {
      label: t('statuses.unknown'),
      color: '#475569',
      bgcolor: '#F1F5F9',
      isPending: false,
    };
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const allSelected = orders.length > 0 && selectedIds.length === orders.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < orders.length;

  const tableHead = [
    {
      id: 'checkbox',
      label: (
        <Checkbox
          checked={allSelected}
          indeterminate={indeterminate}
          onChange={(event) => onSelectAll(event.target.checked)}
          size="small"
        />
      ),
      align: cellAlignment.center,
      width: 48,
    },
    { id: 'orderNumber', label: t('columns.order_number'), align: cellAlignment.center },
    { id: 'studentName', label: t('columns.student_name'), align: cellAlignment.center },
    { id: 'studentCountry', label: t('columns.student_country'), align: cellAlignment.center },
    { id: 'instructorName', label: t('columns.instructor_name'), align: cellAlignment.center },
    { id: 'items', label: t('columns.items'), align: cellAlignment.center },
    { id: 'amount', label: t('columns.amount'), align: cellAlignment.center },
    { id: 'date', label: t('columns.date'), align: cellAlignment.center },
    { id: 'statusValue', label: t('columns.status'), align: cellAlignment.center },
    { id: 'actions', label: t('columns.actions'), align: cellAlignment.center },
  ];

  const customRender = {
    checkbox: (row: OrderRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onClick={(event) => {
          event.stopPropagation();
          onSelectOne(row.id);
        }}
        size="small"
      />
    ),
    orderNumber: (row: OrderRow) => {
      const statusInfo = getStatusInfo(row.status);
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: statusInfo.isPending ? '#B45309' : '#0F172A', whiteSpace: 'nowrap' }}>
          #ORD-{row.id.slice(0, 8).toUpperCase()}
        </Typography>
      );
    },
    studentName: (row: OrderRow) => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
          {row.buyerName || '-'}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
          {row.buyerPhone || row.buyerEmail || ''}
        </Typography>
      </Box>
    ),
    studentCountry: (row: OrderRow) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {row.studentCountryName || '-'}
      </Typography>
    ),
    instructorName: (row: OrderRow) => {
      const instructorNames =
        row.items
          ?.map((item) => item.instructorName)
          .filter((name): name is string => Boolean(name))
          .join(locale === 'ar' ? ' ، ' : ', ') || '-';
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
          {instructorNames}
        </Typography>
      );
    },
    items: (row: OrderRow) => {
      const title =
        row.items
          ?.map((item) => item.courseTitle || item.packageName)
          .filter((name): name is string => Boolean(name))
          .join(locale === 'ar' ? ' ، ' : ', ') || t('default_order_title');
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{title}</Typography>
      );
    },
    amount: (row: OrderRow) => (
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
        {(row.total ?? row.subtotal ?? 0).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
      </Typography>
    ),
    date: (row: OrderRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {formatDate(row.creationTime)}
      </Typography>
    ),
    statusValue: (row: OrderRow) => {
      const statusInfo = getStatusInfo(row.status);
      return (
        <Chip
          label={statusInfo.label}
          size="small"
          sx={{
            bgcolor: statusInfo.bgcolor,
            color: statusInfo.color,
            fontWeight: 700,
            fontSize: 11.5,
            height: 24,
            borderRadius: 1.5,
          }}
        />
      );
    },
    actions: (row: OrderRow) => {
      const statusInfo = getStatusInfo(row.status);
      const busy = actionLoadingId === row.id;

      return (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Button
            size="small"
            variant={statusInfo.isPending || row.receiptUrl ? 'contained' : 'outlined'}
            onClick={() => onViewReceipt(row)}
            startIcon={<Iconify icon="solar:receipt-2-bold" width={15} />}
            sx={{
              ...(statusInfo.isPending || row.receiptUrl
                ? {
                    bgcolor: '#D97706',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#B45309' },
                  }
                : {
                    borderColor: '#E2E8F0',
                    color: '#475569',
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }),
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              px: 1.5,
              height: 30,
              boxShadow: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {statusInfo.isPending || row.receiptUrl
              ? t('btn_inspect_receipt')
              : t('btn_view_receipt')}
          </Button>

          {statusInfo.isPending && (
            <>
              <IconButton
                size="small"
                disabled={busy}
                onClick={() => onApprove(row)}
                title={t('btn_approve')}
                sx={{
                  bgcolor: '#E6F4EA',
                  color: '#10B981',
                  borderRadius: 1.5,
                  width: 30,
                  height: 30,
                  '&:hover': { bgcolor: '#C6F6D5' },
                }}
              >
                {busy ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="eva:checkmark-fill" width={18} />
                )}
              </IconButton>
              <IconButton
                size="small"
                disabled={busy}
                onClick={() => onReject(row)}
                title={t('btn_reject')}
                sx={{
                  bgcolor: '#FCE8E6',
                  color: '#EF4444',
                  borderRadius: 1.5,
                  width: 30,
                  height: 30,
                  '&:hover': { bgcolor: '#FEE2E2' },
                }}
              >
                <Iconify icon="eva:close-fill" width={18} />
              </IconButton>
            </>
          )}
        </Stack>
      );
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

      <SharedTable<OrderRow>
        data={orders}
        tableHead={tableHead}
        customRender={customRender}
        count={totalCount}
        serverPagination
      />
    </Box>
  );
}
