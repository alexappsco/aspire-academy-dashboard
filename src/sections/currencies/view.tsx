'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/routing';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getErrorMessage } from 'src/utils/axios';

import {
  CurrencyDto,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  FormattedCurrencyRow,
} from './types';
import { currenciesService } from './services/currenciesService';
import CurrencyFormDialog from './new-edit-currency-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

function extractCurrencyItems(res: unknown): { items: CurrencyDto[]; total: number } {
  if (!res) return { items: [], total: 0 };
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.items)) {
    return {
      items: r.items as CurrencyDto[],
      total: typeof r.totalCount === 'number' ? r.totalCount : r.items.length,
    };
  }
  if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) {
      return {
        items: d.items as CurrencyDto[],
        total: typeof d.totalCount === 'number' ? d.totalCount : d.items.length,
      };
    }
    if (Array.isArray(r.data)) {
      return { items: r.data as CurrencyDto[], total: r.data.length };
    }
  }
  if (Array.isArray(res)) {
    return { items: res as CurrencyDto[], total: res.length };
  }
  return { items: [], total: 0 };
}

export default function CurrenciesView() {
  const t = useTranslations('Currencies');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const urlFilter = searchParams.get('Filter') || '';
  const urlIsActive = searchParams.get('IsActive');
  const initialStatus =
    urlIsActive === 'true' ? 'active' : urlIsActive === 'false' ? 'inactive' : 'all';

  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Sync browser URL parameters with current active filters
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

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, pathname, router, searchParams]);

  // Fetch Currencies from Server Action
  const fetchCurrencies = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const activeParam =
        statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;

      const res = await currenciesService.getCurrencies({
        Filter: debouncedSearch.trim() || undefined,
        IsActive: activeParam,
      });

      if (res.success && res.data) {
        const { items, total } = extractCurrencyItems(res.data);
        setCurrencies(items);
        setTotalCount(total);
      } else {
        toast.error(res.error || t('messages.fetch_error'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const activeParam =
          statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;

        const res = await currenciesService.getCurrencies({
          Filter: debouncedSearch.trim() || undefined,
          IsActive: activeParam,
        });

        if (!isMounted) return;

        if (res.success && res.data) {
          const { items, total } = extractCurrencyItems(res.data);
          setCurrencies(items);
          setTotalCount(total);
        } else {
          toast.error(res.error || t('messages.fetch_error'));
          setCurrencies([]);
          setTotalCount(0);
        }
      } catch (error: unknown) {
        if (!isMounted) return;
        toast.error(getErrorMessage(error) || t('messages.fetch_error'));
        setCurrencies([]);
        setTotalCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, statusFilter]);

  // Handle Add / Edit submit
  const handleSaveCurrency = async (data: CreateCurrencyDto | UpdateCurrencyDto) => {
    setActionLoading(true);
    try {
      if ('id' in data && data.id) {
        const res = await currenciesService.updateCurrency(data.id, data as UpdateCurrencyDto);
        if (res.success) {
          toast.success(t('messages.update_success'));
          setFormDialogOpen(false);
          setEditingCurrency(null);
          await fetchCurrencies(false);
        } else {
          toast.error(res.error || t('messages.operation_error'));
        }
      } else {
        const res = await currenciesService.createCurrency(data as CreateCurrencyDto);
        if (res.success) {
          toast.success(t('messages.create_success'));
          setFormDialogOpen(false);
          setEditingCurrency(null);
          await fetchCurrencies(false);
        } else {
          toast.error(res.error || t('messages.operation_error'));
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Handle inline status toggle
  const handleToggleStatus = async (item: CurrencyDto) => {
    try {
      const updatedStatus = !item.isActive;
      const res = await currenciesService.updateCurrency(item.id, {
        id: item.id,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        symbol: item.symbol,
        code: item.code,
        isActive: updatedStatus,
      });

      if (res.success) {
        toast.success(t('messages.status_success'));
        setCurrencies((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, isActive: updatedStatus } : c))
        );
      } else {
        toast.error(res.error || t('messages.operation_error'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Handle Delete Currency
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      const res = await currenciesService.deleteCurrency(deletingId);
      if (res.success) {
        toast.success(t('messages.delete_success'));
        setDeleteDialogOpen(false);
        setDeletingId(null);
        await fetchCurrencies(false);
      } else {
        toast.error(res.error || t('messages.operation_error'));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currencies.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllSelected = currencies.length > 0 && selectedIds.length === currencies.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < currencies.length;

  // Format table data
  const tableData: FormattedCurrencyRow[] = currencies.map((curr) => ({
    id: curr.id,
    name_ar: curr.nameAr || '—',
    name_en: curr.nameEn || '—',
    symbol_ar: curr.symbol || '—',
    symbol_en: curr.code || curr.symbol || '—',
    code: curr.code || '—',
    status: curr.isActive,
    raw: curr,
  }));

  const tableHead = [
    {
      id: 'select',
      label: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
          sx={{
            color: '#CBD5E1',
            '&.Mui-checked': { color: '#1B8354' },
            '&.MuiCheckbox-indeterminate': { color: '#1B8354' },
          }}
        />
      ),
      align: cellAlignment.center,
      width: 50,
    },
    { id: 'name_ar', label: t('columns.name_ar'), align: cellAlignment.center },
    { id: 'name_en', label: t('columns.name_en'), align: cellAlignment.center },
    { id: 'symbol_ar', label: t('columns.symbol_ar'), align: cellAlignment.center, width: 120 },
    { id: 'symbol_en', label: t('columns.symbol_en'), align: cellAlignment.center, width: 130 },
    { id: 'code', label: t('columns.code'), align: cellAlignment.center, width: 110 },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 90 },
  ];

  const customRender = {
    select: (row: FormattedCurrencyRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={(e) => handleSelectOne(row.id, e.target.checked)}
        size="small"
        sx={{
          color: '#CBD5E1',
          '&.Mui-checked': { color: '#1B8354' },
        }}
      />
    ),
    name_ar: (row: FormattedCurrencyRow) => (
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E293B' }}>
        {row.name_ar}
      </Typography>
    ),
    name_en: (row: FormattedCurrencyRow) => (
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#475569' }}>
        {row.name_en}
      </Typography>
    ),
    symbol_ar: (row: FormattedCurrencyRow) => (
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B' }}>
        {row.symbol_ar}
      </Typography>
    ),
    symbol_en: (row: FormattedCurrencyRow) => (
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#475569' }}>
        {row.symbol_en}
      </Typography>
    ),
    code: (row: FormattedCurrencyRow) => (
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B' }}>
        {row.code}
      </Typography>
    ),
    status: (row: FormattedCurrencyRow) => (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Switch
          size="small"
          checked={row.status}
          onChange={() => handleToggleStatus(row.raw)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#10B981',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#10B981',
            },
          }}
        />
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: row.status ? '#10B981' : '#94A3B8',
            minWidth: 40,
          }}
        >
          {row.status ? t('active') : t('inactive')}
        </Typography>
      </Stack>
    ),
    actions: (row: FormattedCurrencyRow) => (
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton
          size="small"
          onClick={() => {
            setDeletingId(row.id);
            setDeleteDialogOpen(true);
          }}
          sx={{
            color: '#EF4444',
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => {
            setEditingCurrency(row.raw);
            setFormDialogOpen(true);
          }}
          sx={{
            color: '#64748B',
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Stack>
    ),
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Top Header */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          {t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={() => {
            setEditingCurrency(null);
            setFormDialogOpen(true);
          }}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            fontSize: '0.9375rem',
            gap: 1,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('add_currency')}
        </Button>
      </Stack>

      {/* Main Content Card with Filters & Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid #F1F5F9',
          bgcolor: '#FFFFFF',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {/* Filters Toolbar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: 'center',
            mb: 3,
          }}
        >
          {/* Search Input */}
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:magnifer-linear" width={20} sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                height: 44,
                fontSize: '0.9375rem',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#1B8354' },
              },
              ...(isRtl && {
                '& .MuiOutlinedInput-input': {
                  textAlign: 'right',
                },
              }),
            }}
          />

          {/* Status Filter */}
          <SelectField
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 150 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                height: 44,
                fontSize: '0.9375rem',
                color: '#64748B',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
              },
            }}
          >
            <MenuItem value="all">{t('all_status')}</MenuItem>
            <MenuItem value="active">{t('active')}</MenuItem>
            <MenuItem value="inactive">{t('inactive')}</MenuItem>
          </SelectField>
        </Stack>

        {/* Table Content */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 10,
            }}
          >
            <CircularProgress size={36} sx={{ color: '#1B8354' }} />
          </Box>
        ) : (
          <SharedTable<FormattedCurrencyRow>
            data={tableData}
            count={totalCount}
            tableHead={tableHead}
            customRender={customRender}
            disablePagination={false}
          />
        )}
      </Card>

      {/* Add / Edit Modal Dialog */}
      <CurrencyFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setEditingCurrency(null);
        }}
        initialData={editingCurrency}
        onSave={handleSaveCurrency}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </Box>
  );
}
