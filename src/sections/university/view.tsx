'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getErrorMessage } from 'src/utils/axios';

import { UniversityDto, GetUniversitiesParams } from './types';
import {
  getUniversitiesAction,
  createUniversityAction,
  updateUniversityAction,
  deleteUniversityAction,
} from 'src/actions/unversity';
import UniversityFormDialog from './new-edit-university-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedUniversityRow {
  id: string;
  name_ar: string;
  name_en: string;
  country: string;
  order: number;
  status: boolean;
  raw: UniversityDto;
}

function extractUniversityItems(res: unknown): { items: UniversityDto[]; total: number } {
  if (!res) return { items: [], total: 0 };
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.items)) {
    return {
      items: r.items as UniversityDto[],
      total: typeof r.totalCount === 'number' ? r.totalCount : r.items.length,
    };
  }
  if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) {
      return {
        items: d.items as UniversityDto[],
        total: typeof d.totalCount === 'number' ? d.totalCount : d.items.length,
      };
    }
    if (Array.isArray(r.data)) {
      return { items: r.data as UniversityDto[], total: r.data.length };
    }
  }
  if (Array.isArray(res)) {
    return { items: res as UniversityDto[], total: res.length };
  }
  return { items: [], total: 0 };
}

export default function UniversityView() {
  const t = useTranslations('Universities');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlFilter = searchParams.get('Filter') || '';
  const urlIsActive = searchParams.get('IsActive');
  const initialStatus =
    urlIsActive === 'true' ? 'active' : urlIsActive === 'false' ? 'inactive' : 'all';

  const [universities, setUniversities] = useState<UniversityDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<UniversityDto | null>(null);
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

  const fetchUniversities = useCallback(async () => {
    try {
      const isActiveParam = statusFilter === 'all' ? undefined : statusFilter === 'active';

      const apiParams: GetUniversitiesParams = {
        Filter: debouncedSearch.trim() || undefined,
        IsActive: isActiveParam,
      };

      const res = await getUniversitiesAction(apiParams);
      const { items, total } = extractUniversityItems(res.success ? res.data : null);
      setUniversities(items);
      setTotalCount(total);
    } catch (error: unknown) {
      console.error('Failed to fetch universities:', error);
      toast.error(getErrorMessage(error) || t('messages.fetch_error'));
      setUniversities([]);
      setTotalCount(0);
    }
  }, [debouncedSearch, statusFilter, t, toast]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchUniversities();
      setLoading(false);
    };
    load();
  }, [fetchUniversities]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(universities.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = async (university: UniversityDto) => {
    const nextStatus = !university.isActive;
    setUniversities((prev) =>
      prev.map((u) => (u.id === university.id ? { ...u, isActive: nextStatus } : u))
    );

    try {
      const res = await updateUniversityAction(university.id, {
        nameAr: university.nameAr,
        nameEn: university.nameEn,
        countryId: university.countryId,
        order: university.order,
        isActive: nextStatus,
      });
      if (!res.success) throw new Error(res.error);
      toast.success(t('messages.status_updated'));
    } catch (error: unknown) {
      setUniversities((prev) =>
        prev.map((u) => (u.id === university.id ? { ...u, isActive: !nextStatus } : u))
      );
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    }
  };

  const handleOpenAdd = () => {
    setEditingUniversity(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (university: UniversityDto) => {
    setEditingUniversity(university);
    setFormDialogOpen(true);
  };

  const handleSave = async (data: {
    nameAr: string;
    nameEn: string;
    countryId: string;
    order: number;
    isActive: boolean;
    image?: File | null;
  }) => {
    try {
      setActionLoading(true);
      if (editingUniversity) {
        const res = await updateUniversityAction(editingUniversity.id, data);
        if (!res.success) throw new Error(res.error);
        toast.success(t('messages.edit_success'));
      } else {
        const res = await createUniversityAction(data);
        if (!res.success) throw new Error(res.error);
        toast.success(t('messages.add_success'));
      }
      setFormDialogOpen(false);
      setEditingUniversity(null);
      await fetchUniversities();
    } catch (error: unknown) {
      console.error('Failed to save university:', error);
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
      const res = await deleteUniversityAction(deletingId);
      if (!res.success) throw new Error(res.error);
      toast.success(t('messages.delete_success'));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      setDeleteDialogOpen(false);
      setDeletingId(null);
      await fetchUniversities();
    } catch (error: unknown) {
      console.error('Failed to delete university:', error);
      toast.error(getErrorMessage(error) || t('messages.operation_error'));
    } finally {
      setActionLoading(false);
    }
  };

  const isAllSelected = universities.length > 0 && selectedIds.length === universities.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < universities.length;

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
    { id: 'order', label: t('columns.order'), align: cellAlignment.center, width: 90 },
    { id: 'name_ar', label: t('columns.name_ar'), align: cellAlignment.center },
    { id: 'name_en', label: t('columns.name_en'), align: cellAlignment.center },
    { id: 'country', label: t('columns.country'), align: cellAlignment.center },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 100 },
  ];

  const tableData: FormattedUniversityRow[] = universities.map((u) => ({
    id: u.id,
    name_ar: u.nameAr,
    name_en: u.nameEn,
    country: u.country?.name || '-',
    order: u.order,
    status: u.isActive,
    raw: u,
  }));

  const customRender = {
    checkbox: (row: FormattedUniversityRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    order: (row: FormattedUniversityRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>
        {row.order}
      </Typography>
    ),
    name_ar: (row: FormattedUniversityRow) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>
        {row.name_ar}
      </Typography>
    ),
    name_en: (row: FormattedUniversityRow) => (
      <Typography sx={{ fontSize: 13.5, color: '#475569' }}>
        {row.name_en}
      </Typography>
    ),
    country: (row: FormattedUniversityRow) => (
      <Typography sx={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
        {row.country}
      </Typography>
    ),
    status: (row: FormattedUniversityRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Switch
          checked={row.status}
          onChange={() => handleToggleStatus(row.raw)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
          }}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, fontSize: 13, color: row.status ? '#00A76F' : '#64748B' }}
        >
          {row.status ? t('status.active') : t('status.inactive')}
        </Typography>
      </Box>
    ),
    actions: (row: FormattedUniversityRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <Button
          size="small"
          onClick={() => handleOpenDelete(row.id)}
          sx={{ color: '#E53935', minWidth: 0, p: 0.5 }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </Button>
        <Button
          size="small"
          onClick={() => row.raw && handleOpenEdit(row.raw)}
          sx={{ color: '#637381', minWidth: 0, p: 0.5 }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
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
          {t('add_university')}
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
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

          <SelectField
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            slotProps={{
              select: { displayEmpty: true },
            }}
            sx={{
              minWidth: 150,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          >
            <MenuItem value="all">{t('statuses.all')}</MenuItem>
            <MenuItem value="active">{t('status.active')}</MenuItem>
            <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
          </SelectField>
        </Stack>

        <Box sx={{ px: 1, pb: 2, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#1C252E' }} />
            </Box>
          ) : (
            <SharedTable<FormattedUniversityRow>
              data={tableData}
              count={totalCount}
              tableHead={tableHead}
              customRender={customRender}
              disablePagination={false}
            />
          )}
        </Box>
      </Card>

      <UniversityFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingUniversity}
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
