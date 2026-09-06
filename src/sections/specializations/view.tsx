'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
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

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import {
  getSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
} from 'src/actions/specializations';
import type { Specialization } from 'src/types/specialization';

import SpecializationFormDialog from './new-edit-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedRow {
  id: string;
  checkbox?: string;
  name_ar: string;
  name_en: string;
  field_name: string;
  status: boolean;
  actions?: string;
  raw?: Specialization;
}

export default function SpecializationsView() {
  const t = useTranslations('Specializations');
  const toast = useToast();

  const [items, setItems] = useState<Specialization[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Specialization | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const params: Record<string, unknown> = {
        SkipCount: 0,
        MaxResultCount: 1000,
      };
      if (statusFilter === 'active') params.IsActive = true;
      if (statusFilter === 'inactive') params.IsActive = false;
      if (debouncedSearch.trim()) params.Filter = debouncedSearch.trim();

      const res = await getSpecializations(params);

      if (res.success && res.data) {
        setItems(res.data.items);
        setTotalCount(res.data.totalCount);
      } else {
        toast.error(res.error || 'Failed to load');
      }
    } catch {
      toast.error('Failed to load');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };
        if (statusFilter === 'active') params.IsActive = true;
        if (statusFilter === 'inactive') params.IsActive = false;
        if (debouncedSearch.trim()) params.Filter = debouncedSearch.trim();

        const res = await getSpecializations(params);

        if (!isMounted) return;

        if (res.success && res.data) {
          setItems(res.data.items);
          setTotalCount(res.data.totalCount);
        } else {
          toast.error(res.error || 'Failed to load');
          setItems([]);
          setTotalCount(0);
        }
      } catch {
        if (!isMounted) return;
        toast.error('Failed to load');
        setItems([]);
        setTotalCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, statusFilter, toast]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((c) => c.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = async (id: string) => {
    const item = items.find((c) => c.id === id);
    if (!item) return;

    try {
      const res = await updateSpecialization(id, {
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        fieldId: item.fieldId,
        isActive: !item.isActive,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
        );
        toast.success(t('messages.status_updated'));
      } else {
        toast.error(res.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (item: Specialization) => {
    setEditingItem(item);
    setFormDialogOpen(true);
  };

  const handleSave = async (data: { nameAr: string; nameEn: string; fieldId: string; isActive: boolean }) => {
    try {
      if (editingItem) {
        const res = await updateSpecialization(editingItem.id, data);

        if (res.success) {
          toast.success(t('messages.edit_success'));
          fetchData();
        } else {
          toast.error(res.error || 'Failed to update');
        }
      } else {
        const res = await createSpecialization(data);

        if (res.success) {
          toast.success(t('messages.add_success'));
          fetchData();
        } else {
          toast.error(res.error || 'Failed to create');
        }
      }
    } catch {
      toast.error(editingItem ? 'Failed to update' : 'Failed to create');
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await deleteSpecialization(deletingId);

      if (res.success) {
        toast.success(t('messages.delete_success'));
        setItems((prev) => prev.filter((c) => c.id !== deletingId));
        setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
        setTotalCount((prev) => prev - 1);
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items;

  const isAllSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredItems.length;

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
    { id: 'name_ar', label: t('columns.name_ar'), align: cellAlignment.center },
    { id: 'name_en', label: t('columns.name_en'), align: cellAlignment.center },
    { id: 'field_name', label: t('columns.field'), align: cellAlignment.center },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 100 },
  ];

  const tableData: FormattedRow[] = filteredItems.map((item) => ({
    id: item.id,
    name_ar: item.nameAr,
    name_en: item.nameEn,
    field_name: item.field?.name ?? '',
    status: item.isActive,
    raw: item,
  }));

  const customRender = {
    checkbox: (row: FormattedRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    status: (row: FormattedRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Switch
          checked={row.status}
          onChange={() => handleToggleStatus(row.id)}
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
    actions: (row: FormattedRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <IconButton size="small" onClick={() => handleOpenDelete(row.id)} sx={{ color: '#E53935' }}>
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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenAdd}
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          sx={{
            bgcolor: '#1C252E', color: '#FFFFFF', borderRadius: 1.5, px: 2.5, py: 1.2,
            fontWeight: 700, fontSize: '0.875rem', boxShadow: 'none', gap: 1,
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('add_specialization')}
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5', overflow: 'visible', bgcolor: '#FFFFFF',
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
                    <Iconify icon="solar:magnifer-linear" sx={{ color: '#919EAB' }} width={20} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />
          <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <SelectField
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{ select: { displayEmpty: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2, '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            >
              <MenuItem value="all">{t('status.all')}</MenuItem>
              <MenuItem value="active">{t('status.active')}</MenuItem>
              <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
            </SelectField>
          </Box>
        </Stack>

        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedRow>
            tableHead={tableHead}
            data={tableData}
            count={totalCount}
            customRender={customRender}
          />
        </Box>
      </Card>

      <SpecializationFormDialog
        key={editingItem?.id ?? 'new'}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingItem}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
