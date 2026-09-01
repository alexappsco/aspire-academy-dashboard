'use client';

import React, { useState, useMemo } from 'react';
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

import { MOCK_COUNTRIES, CountryItem } from './_mock';
import CountryFormDialog from './new-edit-country-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedCountryRow {
  id: string;
  checkbox?: string;
  order: number;
  name_ar: string;
  name_en: string;
  status: boolean;
  actions?: string;
  raw?: CountryItem;
}

export default function CountriesView() {
  const t = useTranslations('Countries');
  const toast = useToast();

  const [countries, setCountries] = useState<CountryItem[]>(MOCK_COUNTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtering
  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch =
        country.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.order.toString().includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && country.active) ||
        (statusFilter === 'inactive' && !country.active);

      return matchesSearch && matchesStatus;
    });
  }, [countries, searchQuery, statusFilter]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCountries.map((c) => c.id));
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
    setCountries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.success(t('messages.status_updated'));
  };

  // Add / Edit Handlers
  const handleOpenAdd = () => {
    setEditingCountry(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (country: CountryItem) => {
    setEditingCountry(country);
    setFormDialogOpen(true);
  };

  const handleSaveCountry = (data: Partial<CountryItem>) => {
    if (editingCountry) {
      setCountries((prev) =>
        prev.map((c) =>
          c.id === editingCountry.id
            ? { ...c, ...data, order: Number(data.order) || c.order }
            : c
        )
      );
      toast.success(t('messages.edit_success'));
    } else {
      const newCountry: CountryItem = {
        id: (countries.length + 1).toString(),
        order: Number(data.order) || countries.length + 1,
        name_ar: data.name_ar || '',
        name_en: data.name_en || '',
        active: data.active ?? true,
      };
      setCountries((prev) => [newCountry, ...prev]);
      toast.success(t('messages.add_success'));
    }
  };

  // Delete Handlers
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      setCountries((prev) => prev.filter((c) => c.id !== deletingId));
      setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
      toast.success(t('messages.delete_success'));
      setDeletingId(null);
    }
  };

  // SharedTable configuration
  const isAllSelected =
    filteredCountries.length > 0 &&
    selectedIds.length === filteredCountries.length;

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < filteredCountries.length;

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
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 100 },
  ];

  const tableData: FormattedCountryRow[] = filteredCountries.map((c) => ({
    id: c.id,
    order: c.order,
    name_ar: c.name_ar,
    name_en: c.name_en,
    status: c.active,
    raw: c,
  }));

  const customRender = {
    checkbox: (row: FormattedCountryRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    status: (row: FormattedCountryRow) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
        <Switch
          checked={row.status}
          onChange={() => handleToggleStatus(row.id)}
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
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            gap: 1, // Space between startIcon and button text
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('add_country')}
        </Button>
      </Stack>

      {/* Main card containing Filters and Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Filters and search row */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ p: 2.5, borderBottom: '1px dashed #F1F3F5' }}
        >
          {/* Search TextField */}
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
                '& fieldset': {
                  borderColor: '#E5E7EB',
                },
              },
            }}
          />

          {/* Status Filter Dropdown */}
          <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <SelectField
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
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
          </Box>
        </Stack>

        {/* Table Content */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedCountryRow>
            tableHead={tableHead}
            data={tableData}
            count={filteredCountries.length}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <CountryFormDialog
        key={editingCountry?.id ?? 'new'}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingCountry}
        onSave={handleSaveCountry}
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
