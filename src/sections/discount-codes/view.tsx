'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SimpleTable from 'src/components/SimpleTable';
import { useToast } from 'src/components/toast';

import { MOCK_DISCOUNT_CODES, DiscountCodeItem } from './_mock';
import { DISCOUNT_TYPE_LABELS, DEFAULT_PAGE_SIZE } from './constants';
import DiscountCodeFormDialog from './new-edit-discount-code-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface DiscountCodeRow extends DiscountCodeItem {
  checkbox?: string;
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

export default function DiscountCodesView() {
  const t = useTranslations('DiscountCodes');
  const toast = useToast();

  const [codes, setCodes] = useState<DiscountCodeItem[]>(MOCK_DISCOUNT_CODES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtering
  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && code.active) ||
        (statusFilter === 'inactive' && !code.active);

      const matchesType =
        typeFilter === 'all' || code.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [codes, searchQuery, statusFilter, typeFilter]);

  const counts = useMemo(
    () => ({
      all: codes.length,
      active: codes.filter((c) => c.active).length,
      inactive: codes.filter((c) => !c.active).length,
    }),
    [codes]
  );

  const statusTabs: StatusTab[] = [
    { value: 'all', label: t('tabs.all'), count: counts.all, ...STATUS_TAB_COLORS.all },
    { value: 'active', label: t('tabs.active'), count: counts.active, ...STATUS_TAB_COLORS.active },
    { value: 'inactive', label: t('tabs.inactive'), count: counts.inactive, ...STATUS_TAB_COLORS.inactive },
  ];

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCodes.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle active status
  const handleToggleStatus = (id: string) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.success(t('messages.status_updated'));
  };

  // Add / Edit handlers
  const handleOpenAdd = () => {
    setEditingCode(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (code: DiscountCodeItem) => {
    setEditingCode(code);
    setFormDialogOpen(true);
  };

  const handleSave = (data: Partial<DiscountCodeItem>) => {
    if (editingCode) {
      setCodes((prev) =>
        prev.map((c) =>
          c.id === editingCode.id
            ? { ...c, ...data, value: Number(data.value) || c.value, maxUsage: Number(data.maxUsage) || c.maxUsage }
            : c
        )
      );
      toast.success(t('messages.edit_success'));
    } else {
      const newCode: DiscountCodeItem = {
        id: String(Date.now()),
        code: data.code || '',
        type: data.type || 'percentage',
        value: Number(data.value) || 0,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        maxUsage: Number(data.maxUsage) || 0,
        usedCount: 0,
        active: data.active ?? true,
      };
      setCodes((prev) => [newCode, ...prev]);
      toast.success(t('messages.add_success'));
    }
  };

  // Delete handlers
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setCodes((prev) => prev.filter((c) => c.id !== deletingId));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      toast.success(t('messages.delete_success'));
      setDeletingId(null);
    }
  };

  // Table config
  const isAllSelected =
    filteredCodes.length > 0 && selectedIds.length === filteredCodes.length;

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filteredCodes.length;

  const tableHead = [
    {
      id: 'checkbox',
      label: '',
      width: 50,
      renderHeader: () => (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
    },
    { id: 'code', label: t('columns.code') },
    { id: 'type', label: t('columns.type') },
    { id: 'value', label: t('columns.value') },
    { id: 'startDate', label: t('columns.startDate') },
    { id: 'endDate', label: t('columns.endDate') },
    { id: 'maxUsage', label: t('columns.maxUsage') },
    { id: 'usedCount', label: t('columns.usedCount') },
    { id: 'status', label: t('columns.status'), width: 140 },
  ];

  const tableData: DiscountCodeRow[] = filteredCodes.map((c) => ({ ...c, checkbox: '' }));

  const customRender = {
    checkbox: (row: DiscountCodeRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    type: (row: DiscountCodeRow) => (
      <Chip
        label={DISCOUNT_TYPE_LABELS[row.type]}
        sx={{
          fontWeight: 600,
          borderRadius: '8px',
          minWidth: 80,
          bgcolor: row.type === 'percentage' ? 'rgba(76, 175, 80, 0.12)' : 'rgba(33, 150, 243, 0.12)',
          color: row.type === 'percentage' ? 'rgb(56, 142, 60)' : 'rgb(25, 118, 210)',
        }}
      />
    ),
    status: (row: DiscountCodeRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Switch
          checked={row.active}
          onChange={() => handleToggleStatus(row.id)}
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
            color: row.active ? '#00A76F' : '#64748B',
          }}
        >
          {row.active ? t('status.active') : t('status.inactive')}
        </Typography>
      </Box>
    ),
  };

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" width={18} />,
      onClick: (row: DiscountCodeRow) => handleOpenEdit({ ...row, checkbox: undefined } as unknown as DiscountCodeItem),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" width={18} />,
      sx: { color: '#E53935' },
      onClick: (row: DiscountCodeRow) => handleOpenDelete(row.id),
    },
  ];

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
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
          sx={{
            bgcolor: '#1E293B',
            color: '#FFFFFF',
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            gap: 1,
            '&:hover': { bgcolor: '#0F172A' },
          }}
        >
          <Iconify icon="mingcute:add-line" width={20} />
          {t('add_code')}
        </Button>
      </Stack>

      {/* Main card */}
      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'hidden',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Status tabs */}
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

        {/* Search & filters */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 3, pt: 2, borderBottom: '1px dashed #F1F3F5' }}
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
                borderRadius: 2,
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <SelectField
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#E5E7EB' },
                  },
                }}
              >
                <MenuItem value="all">{t('filters.status_all')}</MenuItem>
                <MenuItem value="active">{t('status.active')}</MenuItem>
                <MenuItem value="inactive">{t('status.inactive')}</MenuItem>
              </SelectField>
            </Box>

            <Box sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <SelectField
                fullWidth
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                slotProps={{ select: { displayEmpty: true } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#E5E7EB' },
                  },
                }}
              >
                <MenuItem value="all">{t('filters.type_all')}</MenuItem>
                <MenuItem value="percentage">{t('filters.percentage')}</MenuItem>
                <MenuItem value="fixed">{t('filters.fixed')}</MenuItem>
              </SelectField>
            </Box>
          </Stack>
        </Stack>

        {/* Table */}
        <SimpleTable<DiscountCodeRow>
          data={tableData}
          headCells={tableHead}
          actions={actions}
          customRender={customRender}
          hidePagination={filteredCodes.length <= DEFAULT_PAGE_SIZE}
        />
      </Card>

      {/* Add / Edit Dialog */}
      <DiscountCodeFormDialog
        key={editingCode?.id ?? 'new'}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingCode}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
