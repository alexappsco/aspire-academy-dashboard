'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { deleteData, editData, getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import {
  TEMP_ORDER,
  type AcademicSemesterFormValues,
  type AcademicSemesterItem,
  type AcademicSemesterPayload,
  type AcademicSemestersListResponse,
} from '@/types/semester';

import DeleteConfirmDialog from './delete-confirm-dialog';
import AcademicSemesterFormDialog from './new-edit-academic-semester-dialog';

interface FormattedAcademicSemester {
  id: string;
  nameAr: string;
  nameEn: string;
  active: boolean;
}

interface AcademicSemestersViewProps {
  initialItems?: AcademicSemesterItem[];
  initialTotal?: number;
}

function buildPayload(
  data: AcademicSemesterFormValues,
  /** Keep existing order on edit/toggle; create uses TEMP_ORDER */
  existingOrder?: number
): AcademicSemesterPayload {
  return {
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    isActive: data.isActive,
    // TEMP_ORDER: remove this line + TEMP_ORDER import when backend drops `order`
    order: existingOrder ?? TEMP_ORDER,
  };
}

export default function AcademicSemestersView({
  initialItems = [],
  initialTotal = 0,
}: AcademicSemestersViewProps) {
  const t = useTranslations('AcademicSemesters');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { error: toastError, success: toastSuccess } = useToast();

  const [items, setItems] = useState<AcademicSemesterItem[]>(initialItems);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const skipInitialFetch = useRef(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicSemesterItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('Filter', debouncedSearch.trim());
      if (statusFilter === 'active') params.set('IsActive', 'true');
      if (statusFilter === 'inactive') params.set('IsActive', 'false');
      params.set('SkipCount', '0');
      params.set('MaxResultCount', '1000');

      const res = await getData<AcademicSemestersListResponse>(
        `${endpoints.semester.list}?${params.toString()}`
      );

      if (res.success) {
        setItems(res.data.items ?? []);
        setTotalCount(res.data.totalCount ?? 0);
      } else {
        toastError(res.error || t('subtitle'));
      }
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, t, toastError]);

  useEffect(() => {
    if (skipInitialFetch.current && !debouncedSearch && statusFilter === 'all') {
      skipInitialFetch.current = false;
      return;
    }
    skipInitialFetch.current = false;
    void fetchList();
  }, [fetchList, debouncedSearch, statusFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedAcademicSemester) => {
    const item = items.find((c) => c.id === row.id);
    if (item) {
      setEditingItem(item);
      setDialogKey((key) => key + 1);
      setDialogOpen(true);
    }
  };

  const handleOpenDelete = (row: FormattedAcademicSemester) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      const res = await deleteData(endpoints.semester.delete(deletingId));
      if (res.success) {
        toastSuccess(t('dialog.delete'));
        setDeleteDialogOpen(false);
        setDeletingId(null);
        await fetchList();
      } else {
        toastError(res.error || 'Error');
      }
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (data: AcademicSemesterFormValues) => {
    setSaving(true);
    try {
      const payload = buildPayload(data, editingItem?.order);
      const res = editingItem
        ? await editData(endpoints.semester.update(editingItem.id), 'PUT', payload)
        : await postData(endpoints.semester.create, payload);

      if (res.success) {
        toastSuccess(editingItem ? t('dialog.save') : t('dialog.add'));
        setDialogOpen(false);
        setEditingItem(null);
        await fetchList();
      } else {
        toastError(('error' in res && res.error) || 'Error');
      }
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const item = items.find((c) => c.id === id);
    if (!item || togglingId) return;

    setTogglingId(id);
    try {
      const payload = buildPayload(
        {
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          isActive: !item.isActive,
        },
        item.order
      );

      const res = await editData(endpoints.semester.update(id), 'PUT', payload);
      if (res.success) {
        setItems((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
      } else {
        toastError(res.error || 'Error');
      }
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Error');
    } finally {
      setTogglingId(null);
    }
  };

  const formattedItems: FormattedAcademicSemester[] = items.map((item) => ({
    id: item.id,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    active: item.isActive,
  }));

  const tableHead = [
    {
      id: 'nameAr',
      label: t('columns.name_ar'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'nameEn',
      label: t('columns.name_en'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedAcademicSemester) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedAcademicSemester) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    active: (row: FormattedAcademicSemester) => {
      const isActive = row.active;
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={isActive}
            disabled={togglingId === row.id}
            onChange={() => handleToggleStatus(row.id)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A76F' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00A76F' },
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600, color: isActive ? '#1E293B' : '#94A3B8' }}>
            {isActive ? t('status.active') : t('status.inactive')}
          </Typography>
        </Box>
      );
    },
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          onClick={handleOpenAdd}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('add_semester')}
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2.5, borderBottom: '1px dashed #F1F3F5' }}
        >
          <TextField
            fullWidth
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
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          <SelectField
            fullWidth
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            slotProps={{
              select: { displayEmpty: true },
            }}
            sx={{
              maxWidth: 200,
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

        <Box sx={{ px: 1, position: 'relative', minHeight: 200 }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.6)',
                zIndex: 2,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          )}
          <SharedTable<FormattedAcademicSemester>
            data={formattedItems}
            count={totalCount || formattedItems.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      <AcademicSemesterFormDialog
        key={dialogKey}
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        initialData={editingItem}
        loading={saving}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </Box>
  );
}
