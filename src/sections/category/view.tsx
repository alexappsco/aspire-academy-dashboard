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

import CategoryFormDialog from './new-edit-category-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';
import type { CategoryFormValues, CategoryItem, FieldsListResponse } from '../../types/category';

const FIELDS_ENDPOINT = '/admin/fields';

interface FormattedCategory {
  id: string;
  name: string;
  image: string;
  order: number;
  active: boolean;
}

interface CategoryViewProps {
  initialItems?: CategoryItem[];
  initialTotal?: number;
}

export default function CategoryView({
  initialItems = [],
  initialTotal = 0,
}: CategoryViewProps) {
  const t = useTranslations('Categories');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { error: toastError, success: toastSuccess } = useToast();

  const [categories, setCategories] = useState<CategoryItem[]>(initialItems);
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
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('Filter', debouncedSearch.trim());
      if (statusFilter === 'active') params.set('IsActive', 'true');
      if (statusFilter === 'inactive') params.set('IsActive', 'false');
      params.set('SkipCount', '0');
      params.set('MaxResultCount', '1000');

      const res = await getData<FieldsListResponse>(`${FIELDS_ENDPOINT}?${params.toString()}`);

      if (res.success) {
        setCategories(res.data.items ?? []);
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
    void fetchCategories();
  }, [fetchCategories, debouncedSearch, statusFilter]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedCategory) => {
    const category = categories.find((c) => c.id === row.id);
    if (category) {
      setEditingCategory(category);
      setDialogKey((key) => key + 1);
      setDialogOpen(true);
    }
  };

  const handleOpenDelete = (row: FormattedCategory) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      const res = await deleteData(`${FIELDS_ENDPOINT}/${deletingId}`);
      if (res.success) {
        toastSuccess(t('dialog.delete'));
        setDeleteDialogOpen(false);
        setDeletingId(null);
        await fetchCategories();
      } else {
        toastError(res.error || 'Error');
      }
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Error');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveCategory = async (data: CategoryFormValues) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('NameAr', data.nameAr);
      formData.append('NameEn', data.nameEn);
      formData.append('Order', String(data.order));
      formData.append('IsActive', String(data.isActive));
      if (data.imageFile) {
        formData.append('Image', data.imageFile);
      }

      const res = editingCategory
        ? await editData(`${FIELDS_ENDPOINT}/${editingCategory.id}`, 'PUT', formData)
        : await postData(`${FIELDS_ENDPOINT}`, formData);

      if (res.success) {
        toastSuccess(t('dialog.save'));
        setDialogOpen(false);
        setEditingCategory(null);
        await fetchCategories();
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
    const category = categories.find((c) => c.id === id);
    if (!category || togglingId) return;

    setTogglingId(id);
    try {
      const formData = new FormData();
      formData.append('NameAr', category.nameAr);
      formData.append('NameEn', category.nameEn);
      formData.append('Order', String(category.order));
      formData.append('IsActive', String(!category.isActive));

      const res = await editData(`${FIELDS_ENDPOINT}/${id}`, 'PUT', formData);
      if (res.success) {
        setCategories((prev) =>
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

  const formattedCategories: FormattedCategory[] = categories.map((item) => ({
    id: item.id,
    name: isRtl ? item.nameAr : item.nameEn,
    image: item.imageUrl,
    order: item.order,
    active: item.isActive,
  }));

  const tableHead = [
    { id: 'image', label: t('columns.image'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'name', label: t('columns.name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'order', label: t('columns.order'), align: 'center' as cellAlignment },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedCategory) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedCategory) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    image: (row: FormattedCategory) => (
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 140,
          height: 120,
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          p: 1.5,
          bgcolor: '#FFFFFF',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box
            component="img"
            src={row.image || '/icons/package.svg'}
            alt={row.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = '/icons/package.svg';
              e.currentTarget.style.objectFit = 'contain';
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#1E293B',
            fontSize: 13,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.name}
        </Typography>
      </Box>
    ),
    order: (row: FormattedCategory) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.order}
      </Typography>
    ),
    active: (row: FormattedCategory) => {
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
          {t('add_category')}
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
          <SharedTable<FormattedCategory>
            data={formattedCategories}
            count={totalCount || formattedCategories.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      <CategoryFormDialog
        key={dialogKey}
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        initialData={editingCategory}
        loading={saving}
        onSave={handleSaveCategory}
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
