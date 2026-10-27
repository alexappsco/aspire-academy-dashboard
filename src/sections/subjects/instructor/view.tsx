'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import type {
  InstructorSubjectItem,
  InstructorSubjectFormValues,
} from 'src/types/instructor-subject';

import { INITIAL_MOCK_SUBJECTS } from './mock-data';
import NewEditSubjectDialog from './new-edit-dialog';
import DeleteSubjectDialog from './delete-dialog';

export default function InstructorSubjectsView() {
  const t = useTranslations('InstructorSubjects');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [items, setItems] = useState<InstructorSubjectItem[]>(INITIAL_MOCK_SUBJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialogs State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InstructorSubjectItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Client-side filtering for UI
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.trim().toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCollege = item.college.toLowerCase().includes(query);
        const matchesSemester = item.semester.toLowerCase().includes(query);
        if (!matchesName && !matchesCollege && !matchesSemester) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'active' && !item.isActive) {
        return false;
      }
      if (statusFilter === 'inactive' && item.isActive) {
        return false;
      }

      return true;
    });
  }, [items, debouncedSearch, statusFilter]);

  // Selection handlers
  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filteredItems.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map((item) => item.id));
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
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
    toast.success(t('messages.status_updated'));
  };

  // Add & Edit Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: InstructorSubjectItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (values: InstructorSubjectFormValues) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...values } : item
        )
      );
      toast.success(t('messages.edit_success'));
    } else {
      const newItem: InstructorSubjectItem = {
        id: `subj-${Date.now()}`,
        ...values,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(t('messages.add_success'));
    }
    setEditingItem(null);
  };

  // Delete Handlers
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingId) return;
    setItems((prev) => prev.filter((item) => item.id !== deletingId));
    setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
    toast.success(t('messages.delete_success'));
    setDeletingId(null);
  };

  // Table Columns Definition matching the user's screenshot
  const tableHead = [
    {
      id: 'checkbox' as keyof InstructorSubjectItem,
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
    {
      id: 'name' as keyof InstructorSubjectItem,
      label: t('columns.name'),
      align: isRtl ? cellAlignment.right : cellAlignment.left,
    },
    {
      id: 'college' as keyof InstructorSubjectItem,
      label: t('columns.college'),
      align: isRtl ? cellAlignment.right : cellAlignment.left,
    },
    {
      id: 'semester' as keyof InstructorSubjectItem,
      label: t('columns.semester'),
      align: isRtl ? cellAlignment.right : cellAlignment.left,
    },
    {
      id: 'isActive' as keyof InstructorSubjectItem,
      label: t('columns.status'),
      align: cellAlignment.center,
      width: 140,
    },
    {
      id: 'actions' as unknown as keyof InstructorSubjectItem,
      label: '',
      align: cellAlignment.center,
      width: 100,
    },
  ];

  // Custom renders matching the design
  const customRender = {
    checkbox: (row: InstructorSubjectItem) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    name: (row: InstructorSubjectItem) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
        {row.name}
      </Typography>
    ),
    college: (row: InstructorSubjectItem) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
        {row.college}
      </Typography>
    ),
    semester: (row: InstructorSubjectItem) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
        {row.semester}
      </Typography>
    ),
    isActive: (row: InstructorSubjectItem) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Switch
          checked={row.isActive}
          onChange={() => handleToggleStatus(row.id)}
          color="success"
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
          {row.isActive ? t('dialog.active') : t('dialog.inactive')}
        </Typography>
      </Box>
    ),
    actions: (row: InstructorSubjectItem) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        <IconButton
          size="small"
          onClick={() => handleOpenDelete(row.id)}
          sx={{ color: '#E53935' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleOpenEdit(row)}
          sx={{ color: '#637381' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Box>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* 1. Header Section */}
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
            gap: 1,
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('add_subject')}
        </Button>
      </Stack>

      {/* 2. Main Card with Search, Filter & SharedTable */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Filters Bar matching the screenshot */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ p: 2.5, alignItems: 'center' }}
        >
          {/* Status Dropdown */}
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
              minWidth: { xs: '100%', sm: 140 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#1E293B',
                '& fieldset': {
                  borderColor: '#E2E8F0',
                },
                '&:hover fieldset': {
                  borderColor: '#CBD5E1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#94A3B8',
                },
              },
            }}
          >
            <MenuItem value="all">{t('status_all')}</MenuItem>
            <MenuItem value="active">{t('status_active')}</MenuItem>
            <MenuItem value="inactive">{t('status_inactive')}</MenuItem>
          </SelectField>

          {/* Search Input */}
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
                    <Iconify
                      icon="solar:magnifer-linear"
                      sx={{ color: '#919EAB' }}
                      width={20}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: '#E2E8F0',
                },
                '&:hover fieldset': {
                  borderColor: '#CBD5E1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#94A3B8',
                },
              },
            }}
          />
        </Stack>

        {/* SharedTable Component */}
        <Box sx={{ p: 1 }}>
          <SharedTable<InstructorSubjectItem>
            data={filteredItems}
            count={filteredItems.length}
            tableHead={tableHead}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <NewEditSubjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSubjectDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
