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
  CountryDto,
  CurrencyDto,
  CreateCountryDto,
  UpdateCountryDto,
  FormattedCountryRow,
} from './types';
import { countriesService } from './services/countriesService';
import CountryFormDialog from './new-edit-country-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

function extractCountryItems(res: unknown): { items: CountryDto[]; total: number } {
  if (!res) return { items: [], total: 0 };
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.items)) {
    return {
      items: r.items as CountryDto[],
      total: typeof r.totalCount === 'number' ? r.totalCount : r.items.length,
    };
  }
  if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) {
      return {
        items: d.items as CountryDto[],
        total: typeof d.totalCount === 'number' ? d.totalCount : d.items.length,
      };
    }
    if (Array.isArray(r.data)) {
      return { items: r.data as CountryDto[], total: r.data.length };
    }
  }
  if (Array.isArray(res)) {
    return { items: res as CountryDto[], total: res.length };
  }
  return { items: [], total: 0 };
}

export default function CountriesView() {
  const t = useTranslations('Countries');
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

  const [countries, setCountries] = useState<CountryDto[]>([]);
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
  const [editingCountry, setEditingCountry] = useState<CountryDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input to optimize backend requests
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

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, pathname, router, searchParams]);

  // Re-fetch helper
  const refetchCountries = async () => {
    try {
      setLoading(true);
      const isActiveParam =
        statusFilter === 'all' ? undefined : statusFilter === 'active';

      const res = await countriesService.getCountries({
        Filter: debouncedSearch.trim() || undefined,
        IsActive: isActiveParam,
      });

      const { items, total } = extractCountryItems(res);
      setCountries(items);
      setTotalCount(total);
    } catch (error: unknown) {
      console.error('Failed to fetch countries:', error);
      toast.error(getErrorMessage(error) || t('messages.fetch_error'));
      setCountries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch Countries and Currencies on mount & filter changes
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const isActiveParam =
          statusFilter === 'all' ? undefined : statusFilter === 'active';

        const [res, currs] = await Promise.all([
          countriesService.getCountries({
            Filter: debouncedSearch.trim() || undefined,
            IsActive: isActiveParam,
          }),
          countriesService.getCurrencies(),
        ]);

        if (!isMounted) return;

        const { items, total } = extractCountryItems(res);
        setCountries(items);
        setTotalCount(total);

        if (currs) {
          setCurrencies(currs);
        }
      } catch (error: unknown) {
        if (!isMounted) return;
        console.error('Failed to fetch countries:', error);
        toast.error(getErrorMessage(error) || t('messages.fetch_error'));
        setCountries([]);
        setTotalCount(0);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, statusFilter, t, toast]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(countries.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle active status via Backend PUT
  const handleToggleStatus = async (country: CountryDto) => {
    const nextStatus = !country.isActive;
    // Optimistic UI update
    setCountries((prev) =>
      prev.map((c) => (c.id === country.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      await countriesService.updateCountry(country.id, {
        ...country,
        isActive: nextStatus,
      });
      toast.success(t('messages.status_updated'));
    } catch (error: unknown) {
      // Revert on error
      setCountries((prev) =>
        prev.map((c) => (c.id === country.id ? { ...c, isActive: !nextStatus } : c))
      );
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    }
  };

  // Add / Edit Handlers
  const handleOpenAdd = () => {
    setEditingCountry(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (country: CountryDto) => {
    setEditingCountry(country);
    setFormDialogOpen(true);
  };

  const handleSaveCountry = async (data: CreateCountryDto | UpdateCountryDto) => {
    try {
      setActionLoading(true);
      if (editingCountry) {
        await countriesService.updateCountry(editingCountry.id, data as UpdateCountryDto);
        toast.success(t('messages.edit_success'));
      } else {
        await countriesService.createCountry(data as CreateCountryDto);
        toast.success(t('messages.add_success'));
      }
      setFormDialogOpen(false);
      setEditingCountry(null);
      await refetchCountries();
    } catch (error: unknown) {
      console.error('Failed to save country:', error);
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      setActionLoading(true);
      await countriesService.deleteCountry(deletingId);
      toast.success(t('messages.delete_success'));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
      await refetchCountries();
    } catch (error: unknown) {
      console.error('Failed to delete country:', error);
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    } finally {
      setActionLoading(false);
    }
  };

  // SharedTable configuration
  const isAllSelected =
    countries.length > 0 && selectedIds.length === countries.length;

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < countries.length;

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
    { id: 'order', label: t('columns.id'), align: cellAlignment.center, width: 90 },
    { id: 'name_ar', label: t('columns.name_ar'), align: cellAlignment.center },
    { id: 'name_en', label: t('columns.name_en'), align: cellAlignment.center },
    { id: 'code', label: t('columns.code'), align: cellAlignment.center, width: 110 },
    { id: 'currency_name', label: t('columns.currency'), align: cellAlignment.center, width: 140 },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 100 },
  ];

  const tableData: FormattedCountryRow[] = countries.map((c) => {
    let currText = '-';
    if (c.currency) {
      const name = isRtl
        ? (c.currency.nameAr || c.currency.name || c.currency.nameEn)
        : (c.currency.nameEn || c.currency.name || c.currency.nameAr);
      currText = `${name} (${c.currency.symbol || c.currency.code})`;
    }
    return {
      id: c.id,
      order: c.order,
      name_ar: c.nameAr,
      name_en: c.nameEn,
      code: c.code || '-',
      currency_name: currText,
      status: c.isActive ?? true,
      raw: c,
    };
  });

  const customRender = {
    checkbox: (row: FormattedCountryRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    order: (row: FormattedCountryRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>
        {row.order}
      </Typography>
    ),
    name_ar: (row: FormattedCountryRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>
        {row.name_ar}
      </Typography>
    ),
    name_en: (row: FormattedCountryRow) => (
      <Typography sx={{ fontSize: 13.5, color: '#475569' }}>
        {row.name_en}
      </Typography>
    ),
    code: (row: FormattedCountryRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.code}
      </Typography>
    ),
    currency_name: (row: FormattedCountryRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.currency_name}
      </Typography>
    ),
    status: (row: FormattedCountryRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Switch
          checked={row.status}
          onChange={() => handleToggleStatus(row.raw)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#00A76F',
            },
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
            color: row.status ? '#00A76F' : '#64748B',
          }}
        >
          {row.status ? t('status.active') : t('status.inactive')}
        </Typography>
      </Box>
    ),
    actions: (row: FormattedCountryRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => handleOpenDelete(row.id)}
          sx={{ color: '#E53935' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => row.raw && handleOpenEdit(row.raw)}
          sx={{ color: '#637381' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Box>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header section */}
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
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('add_country')}
        </Button>
      </Stack>

      {/* Main card with filter bar and table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
        }}
      >
        {/* Filter bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Search field */}
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
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
              },
            }}
          />

          {/* Status Filter */}
          <SelectField
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            slotProps={{
              select: {
                displayEmpty: true,
              },
            }}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
              },
            }}
          >
            <MenuItem value="all">{t('status.all')}</MenuItem>
            <MenuItem value="active">{t('status.active')}</MenuItem>
            <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
          </SelectField>
        </Stack>

        {/* Table list */}
        <Box sx={{ px: 1, pb: 2, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#1C252E' }} />
            </Box>
          ) : (
            <SharedTable<FormattedCountryRow>
              data={tableData}
              count={totalCount}
              tableHead={tableHead}
              customRender={customRender}
              disablePagination={false}
            />
          )}
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <CountryFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingCountry}
        currencies={currencies}
        onSave={handleSaveCountry}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
      />
    </Box>
  );
}
