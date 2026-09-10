'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { getOrders, approveOrder, rejectOrder } from 'src/actions/orders';
import { ORDER_STATUS, isPendingOrder, OrderDto } from 'src/types/order';
import PaymentReceiptDialog, { PaymentReceiptData } from './dialog-paid-resit';

interface CourseStudentsTabProps {
  courseId: string;
}

type StatusFilterValue = 'all' | '0' | '1' | '2';

const TABLE_HEAD_ALIGN: { [key: string]: cellAlignment } = {
  student: cellAlignment.right,
  phone: cellAlignment.center,
  price: cellAlignment.center,
  order_date: cellAlignment.center,
  status: cellAlignment.center,
  actions: cellAlignment.center,
};

export default function CourseStudentsTab({ courseId }: CourseStudentsTabProps) {
  const t = useTranslations('CourseStudentsTab');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const toast = useToast();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<OrderDto | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<OrderDto | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await getOrders({
      CourseId: courseId,
      Filter: debouncedSearch.trim() || undefined,
      Status: statusFilter === 'all' ? undefined : statusFilter,
      SkipCount: 0,
      MaxResultCount: 1000,
    });
    if (res.success && res.data) {
      setOrders(res.data.items);
    } else {
      toast.error(res.error || t('messages.load_failed'));
    }
    setLoading(false);
  }, [courseId, debouncedSearch, statusFilter, t, toast]);

  // Debounce search input to avoid spamming the backend
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders on mount & when filters change
  useEffect(() => {
    let active = true;
    const run = async () => {
      const res = await getOrders({
        CourseId: courseId,
        Filter: debouncedSearch.trim() || undefined,
        Status: statusFilter === 'all' ? undefined : statusFilter,
        SkipCount: 0,
        MaxResultCount: 1000,
      });
      if (!active) return;
      if (res.success && res.data) {
        setOrders(res.data.items);
      } else {
        toast.error(res.error || t('messages.load_failed'));
      }
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [courseId, debouncedSearch, statusFilter, t, toast]);

  const handleApprove = async (order: OrderDto) => {
    setActionLoadingId(order.id);
    const res = await approveOrder(order.id);
    if (res.success) {
      toast.success(t('messages.approved'));
      fetchOrders();
    } else {
      toast.error(
        res.error === 'OrderNotPending' ? t('messages.order_not_pending') : res.error || t('messages.approve_failed')
      );
    }
    setActionLoadingId(null);
  };

  const openRejectDialog = (order: OrderDto) => {
    setRejectTarget(order);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejectLoading(true);
    const res = await rejectOrder(rejectTarget.id, rejectReason.trim());
    if (res.success) {
      toast.success(t('messages.rejected'));
      setRejectTarget(null);
      setRejectReason('');
      fetchOrders();
    } else {
      toast.error(
        res.error === 'OrderNotPending' ? t('messages.order_not_pending') : res.error || t('messages.reject_failed')
      );
    }
    setRejectLoading(false);
  };

  const buildReceiptData = (order: OrderDto): PaymentReceiptData => {
    const item = order.items?.find((i) => i.courseId) ?? order.items?.[0];
    return {
      refNumber: order.id,
      bankName: 'بنك مصر • Banque Misr',
      bankSubtext: 'إشعار تحويل مصرفي إلكتروني رسمي',
      amount: order.total ?? 0,
      currency: 'جنيه مصري (EGP)',
      amountInWords: 'فقط ' + (order.total ?? 0).toLocaleString('ar-EG') + ' جنيهاً مصرياً لا غير',
      transactionTime: order.creationTime
        ? new Date(order.creationTime).toLocaleString(isRtl ? 'ar-KW' : 'en-US')
        : '—',
      senderName: order.buyerName || '—',
      receiverName: 'أكاديمية أسباير للتعليم الطبي (Aspire)',
      iban: 'EG3400020001000000284918234',
      purpose: item?.courseTitle ? `رسوم دورة ${item.courseTitle}` : 'رسوم دورة',
    };
  };

  const handleReceiptAccept = () => {
    if (!receiptOrder) return;
    const order = receiptOrder;
    setReceiptOrder(null);
    void handleApprove(order);
  };

  const handleReceiptReject = () => {
    if (!receiptOrder) return;
    const order = receiptOrder;
    setReceiptOrder(null);
    openRejectDialog(order);
  };

  const statusConfig = (order: OrderDto) => {
    if (Number(order.status) === ORDER_STATUS.APPROVED) {
      return { label: t('statuses.approved'), bg: '#D1FAE5', color: '#059669' };
    }
    if (Number(order.status) === ORDER_STATUS.REJECTED) {
      return { label: t('statuses.rejected'), bg: '#FEE2E2', color: '#DC2626' };
    }
    return { label: t('statuses.pending'), bg: '#FEF3C7', color: '#D97706' };
  };

  const formatDate = (value: string): string => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(isRtl ? 'ar-KW' : 'en-US');
  };

  const formatPrice = (value: number): string =>
    value != null ? value.toLocaleString(isRtl ? 'ar-KW' : 'en-US') : '—';

  const tableHead = [
    { id: 'student', label: t('columns.student'), align: TABLE_HEAD_ALIGN.student },
    { id: 'phone', label: t('columns.phone'), align: TABLE_HEAD_ALIGN.phone },
    { id: 'price', label: t('columns.price'), align: TABLE_HEAD_ALIGN.price },
    { id: 'order_date', label: t('columns.order_date'), align: TABLE_HEAD_ALIGN.order_date },
    { id: 'status', label: t('columns.status'), align: TABLE_HEAD_ALIGN.status },
    { id: 'actions', label: t('columns.actions'), align: TABLE_HEAD_ALIGN.actions },
  ];

  const customRender = {
    student: (row: OrderDto) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#EFF6FF',
            color: '#0284C7',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {(row.buyerName || '?').charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
            {row.buyerName || '—'}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: '#64748B',
              maxWidth: 220,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.buyerEmail || ''}
          </Typography>
        </Box>
      </Stack>
    ),
    phone: (row: OrderDto) => (
      <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
        {row.buyerPhone || '—'}
      </Typography>
    ),
    price: (row: OrderDto) => (
      <Typography sx={{ fontSize: 13, color: '#334155', fontWeight: 700 }}>
        {formatPrice(row.total)}
      </Typography>
    ),
    order_date: (row: OrderDto) => (
      <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
        {formatDate(row.creationTime)}
      </Typography>
    ),
    status: (row: OrderDto) => {
      const cfg = statusConfig(row);
      return (
        <Chip
          label={cfg.label}
          size="small"
          sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 12, borderRadius: 1.5 }}
        />
      );
    },
    actions: (row: OrderDto) => {
      const pending = isPendingOrder(row.status);
      const busy = actionLoadingId === row.id;
      return (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setReceiptOrder(row)}
            startIcon={<Iconify icon="solar:receipt-2-bold" width={15} />}
            sx={{
              borderRadius: 1.5,
              borderColor: '#BFDBFE',
              color: '#2563EB',
              fontSize: 11.5,
              px: 1.2,
              fontWeight: 700,
              height: 30,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { borderColor: '#93C5FD', bgcolor: '#EFF6FF' },
            }}
          >
            {t('actions.view_receipt')}
          </Button>
          {pending ? (
            <>
              <IconButton
                size="small"
                disabled={busy}
                onClick={() => handleApprove(row)}
                title={t('actions.approve')}
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
                onClick={() => openRejectDialog(row)}
                title={t('actions.reject')}
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
          ) : (
            <Typography sx={{ fontSize: 11.5, color: '#CBD5E1', fontWeight: 600 }}>—</Typography>
          )}
        </Stack>
      );
    },
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Filter Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 2.5,
          }}
        >
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilterValue)}
            sx={{
              width: 150,
              bgcolor: '#F8FAFC',
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          >
            <MenuItem value="all">{t('filters.all')}</MenuItem>
            <MenuItem value={String(ORDER_STATUS.PENDING)}>{t('statuses.pending')}</MenuItem>
            <MenuItem value={String(ORDER_STATUS.APPROVED)}>{t('statuses.approved')}</MenuItem>
            <MenuItem value={String(ORDER_STATUS.REJECTED)}>{t('statuses.rejected')}</MenuItem>
          </TextField>

          <TextField
            size="small"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: 340 },
              bgcolor: '#F8FAFC',
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
        </Stack>

        {/* Orders Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ color: '#0284C7' }} />
          </Box>
        ) : (
          <SharedTable<OrderDto>
            data={orders}
            count={orders.length}
            tableHead={tableHead}
            customRender={customRender}
          />
        )}
      </Card>

      {/* Reject Order Dialog */}
      <Dialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B', fontSize: 17, pb: 1 }}>
          {t('reject_dialog.title')}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            label={t('reject_dialog.reason_label')}
            placeholder={t('reject_dialog.reason_placeholder')}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setRejectTarget(null)}
            sx={{ borderRadius: 2, color: '#475569', borderColor: '#E2E8F0', fontWeight: 600 }}
          >
            {t('reject_dialog.cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={!rejectReason.trim() || rejectLoading}
            startIcon={rejectLoading && <CircularProgress size={16} color="inherit" />}
            onClick={handleReject}
            sx={{
              bgcolor: '#E11D48',
              color: '#FFFFFF',
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#BE123C' },
            }}
          >
            {t('reject_dialog.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Receipt Dialog */}
      {receiptOrder && (
        <PaymentReceiptDialog
          open
          onClose={() => setReceiptOrder(null)}
          onAccept={handleReceiptAccept}
          onReject={handleReceiptReject}
          data={buildReceiptData(receiptOrder)}
        />
      )}
    </Stack>
  );
}