'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/routing';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getErrorMessage } from 'src/utils/axios';

import { CouponDto, CouponType, CreateCouponDto, GetCouponsParams, COUPON_TYPE_MAP, COUPON_TYPE_REVERSE } from './types';
import {
  getCouponsAction,
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
} from 'src/actions/coupons';
import { DISCOUNT_TYPE_LABELS, DISCOUNT_TYPE_STYLES, DEFAULT_PAGE_SIZE } from './constants';
import DiscountCodeFormDialog from './new-edit-discount-code-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface CouponRow {
  id: string;
  code: string;
  type: number;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startAt: string;
  endAt: string;
  maxRedemptions: number;
  redemptionCount: number;
  isActive: boolean;
  raw: CouponDto;
}

interface StatusTab {
  value: string;
  count: number;
  label: string;
  bgColor: string;
  textColor: string;
}

const STATUS_TAB_COLORS: Record<string, { bgColor: string; textColor: string }> = {
  all: { bgColor: '#1f2937', textColor: '#ffffff' },
  active: { bgColor: '#d1fae5', textColor: '#059669' },
  inactive: { bgColor: '#f1f5f9', textColor: '#64748b' },
};

function extractCouponItems(res: unknown): { items: CouponDto[]; total: number } {
  if (!res) return { items: [], total: 0 };
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.items)) {
    return {
      items: r.items as CouponDto[],
      total: typeof r.totalCount === 'number' ? r.totalCount : r.items.length,
    };
  }
  if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) {
      return {
        items: d.items as CouponDto[],
        total: typeof d.totalCount === 'number' ? d.totalCount : d.items.length,
      };
    }
    if (Array.isArray(r.data)) {
      return { items: r.data as CouponDto[], total: r.data.length };
    }
  }
  if (Array.isArray(res)) {
    return { items: res as CouponDto[], total: res.length };
  }
  return { items: [], total: 0 };
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export default function DiscountCodesView() {
  const t = useTranslations('DiscountCodes');
  const locale = useLocale() as 'en' | 'ar';
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlFilter = searchParams.get('Filter') || '';
  const urlIsActive = searchParams.get('IsActive');
  const initialStatus =
    urlIsActive === 'true' ? 'active' : urlIsActive === 'false' ? 'inactive' : 'all';

  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState<'all' | CouponType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CouponDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set('Filter', debouncedSearch.trim());
    } else {
      params.delete('Filter');
    }

    if (statusFilter === 'active') {
      params.set('IsActive', 'true');
    } else if (statusFilter === 'inactive') {
      params.set('IsActive', 'false');
    } else {
      params.delete('IsActive');
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, pathname, router, searchParams]);

  const fetchCoupons = useCallback(async () => {
    try {
      const isActiveParam =
        statusFilter === 'all' ? undefined : statusFilter === 'active';

      const apiParams: GetCouponsParams = {
        Filter: debouncedSearch.trim() || undefined,
        IsActive: isActiveParam,
        MaxResultCount: 100,
      };

      const res = await getCouponsAction(apiParams);
      const { items, total } = extractCouponItems(res.success ? res.data : null);
      setCoupons(items);
      setTotalCount(total);
    } catch (error: unknown) {
      console.error('Failed to fetch coupons:', error);
      toast.error(getErrorMessage(error) || t('messages.fetch_error'));
      setCoupons([]);
      setTotalCount(0);
    }
  }, [debouncedSearch, statusFilter, t, toast]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchCoupons();
      setLoading(false);
    };
    load();
  }, [fetchCoupons]);

  const filteredCoupons = typeFilter === 'all'
    ? coupons
    : coupons.filter((c) => c.type === COUPON_TYPE_REVERSE[typeFilter]);

  const counts = {
    all: totalCount,
    active: statusFilter === 'active' ? totalCount : coupons.filter((c) => c.isActive).length,
    inactive: statusFilter === 'inactive' ? totalCount : coupons.filter((c) => !c.isActive).length,
  };

  const statusTabs: StatusTab[] = [
    { value: 'all', label: t('tabs.all'), count: counts.all, ...STATUS_TAB_COLORS.all },
    { value: 'active', label: t('tabs.active'), count: counts.active, ...STATUS_TAB_COLORS.active },
    { value: 'inactive', label: t('tabs.inactive'), count: counts.inactive, ...STATUS_TAB_COLORS.inactive },
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCoupons.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = async (coupon: CouponDto) => {
    const nextStatus = !coupon.isActive;
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      const res = await updateCouponAction(coupon.id, {
        code: coupon.code,
        type: COUPON_TYPE_MAP[coupon.type] || 'Fixed',
        value: coupon.value,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minOrderAmount: coupon.minOrderAmount,
        startAt: coupon.startAt,
        endAt: coupon.endAt,
        maxRedemptions: coupon.maxRedemptions,
        maxRedemptionsPerStudent: coupon.maxRedemptionsPerStudent,
        isActive: nextStatus,
      });
      if (!res.success) throw new Error(res.error);
      toast.success(t('messages.status_updated'));
    } catch (error: unknown) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !nextStatus } : c))
      );
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    }
  };

  const handleOpenAdd = () => {
    setEditingCode(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (coupon: CouponDto) => {
    setEditingCode(coupon);
    setFormDialogOpen(true);
  };

  const handleSave = async (data: CreateCouponDto) => {
    try {
      setActionLoading(true);
      if (editingCode) {
        const res = await updateCouponAction(editingCode.id, data);
        if (!res.success) throw new Error(res.error);
        toast.success(t('messages.edit_success'));
      } else {
        const res = await createCouponAction(data);
        if (!res.success) throw new Error(res.error);
        toast.success(t('messages.add_success'));
      }
      setFormDialogOpen(false);
      setEditingCode(null);
      await fetchCoupons();
    } catch (error: unknown) {
      console.error('Failed to save coupon:', error);
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setActionLoading(true);
      const res = await deleteCouponAction(deletingId);
      if (!res.success) throw new Error(res.error);
      toast.success(t('messages.delete_success'));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
      await fetchCoupons();
    } catch (error: unknown) {
      console.error('Failed to delete coupon:', error);
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const isAllSelected =
    filteredCoupons.length > 0 && selectedIds.length === filteredCoupons.length;

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filteredCoupons.length;

  const tableHead = [
    {
      id: 'checkbox',
      label: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
      align: cellAlignment.center,
      width: 50,
    },
    { id: 'code', label: t('columns.code'), align: cellAlignment.center },
    { id: 'type', label: t('columns.type'), align: cellAlignment.center, width: 120 },
    { id: 'value', label: t('columns.value'), align: cellAlignment.center, width: 100 },
    { id: 'minOrderAmount', label: t('columns.minOrderAmount'), align: cellAlignment.center },
    { id: 'maxDiscountAmount', label: t('columns.maxDiscountAmount'), align: cellAlignment.center },
    { id: 'startAt', label: t('columns.startAt'), align: cellAlignment.center, width: 120 },
    { id: 'endAt', label: t('columns.endAt'), align: cellAlignment.center, width: 120 },
    { id: 'maxRedemptions', label: t('columns.maxRedemptions'), align: cellAlignment.center },
    { id: 'redemptionCount', label: t('columns.redemptionCount'), align: cellAlignment.center },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 100 },
  ];

  const tableData: CouponRow[] = filteredCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minOrderAmount: c.minOrderAmount,
    maxDiscountAmount: c.maxDiscountAmount,
    startAt: c.startAt,
    endAt: c.endAt,
    maxRedemptions: c.maxRedemptions,
    redemptionCount: c.redemptionCount,
    isActive: c.isActive,
    raw: c,
  }));

  const customRender = {
    checkbox: (row: CouponRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    type: (row: CouponRow) => {
      const typeKey: CouponType = COUPON_TYPE_MAP[row.type] || 'Fixed';
      const style = DISCOUNT_TYPE_STYLES[typeKey] || DISCOUNT_TYPE_STYLES.Fixed;
      const label = DISCOUNT_TYPE_LABELS[typeKey]?.[locale] || row.type;
      return (
        <Chip
          label={label}
          sx={{
            fontWeight: 600,
            borderRadius: '8px',
            minWidth: 80,
            bgcolor: style.bgcolor,
            color: style.color,
          }}
        />
      );
    },
    value: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>
        {row.type === 2 ? `${row.value}%` : row.value}
      </Typography>
    ),
    minOrderAmount: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.minOrderAmount}
      </Typography>
    ),
    maxDiscountAmount: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.maxDiscountAmount}
      </Typography>
    ),
    startAt: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {formatDate(row.startAt)}
      </Typography>
    ),
    endAt: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {formatDate(row.endAt)}
      </Typography>
    ),
    maxRedemptions: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.maxRedemptions}
      </Typography>
    ),
    redemptionCount: (row: CouponRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.redemptionCount}
      </Typography>
    ),
    status: (row: CouponRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Switch
          checked={row.isActive}
          onChange={() => handleToggleStatus(row.raw)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#00A76F',
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: 13,
            color: row.isActive ? '#00A76F' : '#64748B',
          }}
        >
          {row.isActive ? t('status.active') : t('status.inactive')}
        </Typography>
      </Box>
    ),
    actions: (row: CouponRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Button
          size="small"
          onClick={() => handleOpenEdit(row.raw)}
          sx={{ color: '#637381', minWidth: 0, p: 0.5 }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </Button>
        <Button
          size="small"
          onClick={() => handleOpenDelete(row.id)}
          sx={{ color: '#E53935', minWidth: 0, p: 0.5 }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </Button>
      </Box>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleOpenAdd}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            boxShadow: 'none',
            gap: 1,
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('add_code')}
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
        }}
      >
        <Stack direction="row" spacing={2} sx={{ p: 3, pb: 1, flexWrap: 'wrap' }}>
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <Box
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  pb: 1.5,
                  borderBottom: active ? '2px solid #1B8354' : '2px solid transparent',
                  color: active ? '#1E293B' : '#64748B',
                  transition: 'color 0.2s ease',
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{tab.label}</Typography>
                <Box
                  sx={{
                    bgcolor: tab.bgColor,
                    color: tab.textColor,
                    borderRadius: '8px',
                    minWidth: 26,
                    height: 22,
                    px: 0.75,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </Box>
              </Box>
            );
          })}
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2.5, justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #F1F3F5' }}
        >
          <TextField
            size="small"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SelectField
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{ select: { displayEmpty: true } }}
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            >
              <MenuItem value="all">{t('filters.status_all')}</MenuItem>
              <MenuItem value="active">{t('status.active')}</MenuItem>
              <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
            </SelectField>

            <SelectField
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value === 'all' ? 'all' : e.target.value as CouponType)}
              slotProps={{ select: { displayEmpty: true } }}
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            >
              <MenuItem value="all">{t('filters.type_all')}</MenuItem>
              <MenuItem value="Percentage">{t('filters.percentage')}</MenuItem>
              <MenuItem value="Fixed">{t('filters.fixed')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        <Box sx={{ px: 1, pb: 2, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#1C252E' }} />
            </Box>
          ) : (
            <SharedTable<CouponRow>
              data={tableData}
              count={totalCount}
              tableHead={tableHead}
              customRender={customRender}
              disablePagination={false}
            />
          )}
        </Box>
      </Card>

      <DiscountCodeFormDialog
        key={editingCode?.id ?? 'new'}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingCode}
        onSave={handleSave}
        loading={actionLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </Box>
  );
}
