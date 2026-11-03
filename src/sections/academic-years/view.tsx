'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { deleteData, editData, getData, postData } from 'src/utils/crud-fetch-api';
import { endpoints } from 'src/utils/endpoints';
import {
  TEMP_ORDER,
  type AcademicYearFormValues,
  type AcademicYearItem,
  type AcademicYearPayload,
  type AcademicYearsListResponse,
} from 'src/types/academic-year';

import AcademicYearFormDialog from './new-edit-academic-year-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedAcademicYear {
  id: string;
  nameAr: string;
  nameEn: string;
  faculties: string[];
  semesters: string[];
  active: boolean;
}

interface AcademicYearsViewProps {
  initialItems?: AcademicYearItem[];
  initialTotal?: number;
}

function buildPayload(
  data: AcademicYearFormValues,
  /** Keep existing order on edit/toggle; create uses TEMP_ORDER */
  existingOrder?: number
): AcademicYearPayload {
  return {
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    facultyIds: data.facultyIds,
    semesterIds: data.semesterIds,
    isActive: data.isActive,
    // TEMP_ORDER: remove this line + TEMP_ORDER import when backend drops `order`
    order: existingOrder ?? TEMP_ORDER,
  };
}

export default function AcademicYearsView({
  initialItems = [],
  initialTotal = 0,
}: AcademicYearsViewProps) {
  const t = useTranslations('AcademicYears');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { error: toastError, success: toastSuccess } = useToast();

  const [items, setItems] = useState<AcademicYearItem[]>(initialItems);
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
  const [editingItem, setEditingItem] = useState<AcademicYearItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedYearForFaculties, setSelectedYearForFaculties] =
    useState<FormattedAcademicYear | null>(null);

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

      const res = await getData<AcademicYearsListResponse>(
        `${endpoints.academicYear.list}?${params.toString()}`
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

  const handleOpenEdit = (row: FormattedAcademicYear) => {
    const item = items.find((c) => c.id === row.id);
    if (item) {
      setEditingItem(item);
      setDialogKey((key) => key + 1);
      setDialogOpen(true);
    }
  };

  const handleOpenDelete = (row: FormattedAcademicYear) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      const res = await deleteData(endpoints.academicYear.delete(deletingId));
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

  const handleSave = async (data: AcademicYearFormValues) => {
    setSaving(true);
    try {
      const payload = buildPayload(data, editingItem?.order);
      const res = editingItem
        ? await editData(endpoints.academicYear.update(editingItem.id), 'PUT', payload)
        : await postData(endpoints.academicYear.create, payload);

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
          facultyIds: (item.faculties ?? []).map((f) => f.id),
          semesterIds: (item.semesters ?? []).map((s) => s.id),
          isActive: !item.isActive,
        },
        item.order
      );

      const res = await editData(endpoints.academicYear.update(id), 'PUT', payload);
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

  const formattedItems: FormattedAcademicYear[] = items.map((item) => ({
    id: item.id,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    faculties: (item.faculties ?? []).map((f) => f.name),
    semesters: (item.semesters ?? []).map((s) => s.name),
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
    {
      id: 'faculties',
      label: t('columns.faculties'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'semesters',
      label: t('columns.semesters'),
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const renderChips = (names: string[], max: number, onMoreClick?: () => void) =>
    names.length === 0 ? (
      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
        —
      </Typography>
    ) : (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {names.slice(0, max).map((name) => (
          <Chip key={name} size="small" label={name} sx={{ borderRadius: 1.5 }} />
        ))}
        {names.length > max &&
          (onMoreClick ? (
            <Tooltip title={t('view_all_faculties')}>
              <Chip
                size="small"
                label={`+${names.length - max}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreClick();
                }}
                sx={{
                  bgcolor: '#00A76F14',
                  color: '#00A76F',
                  fontWeight: 700,
                  fontSize: 11,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  border: '1px solid #00A76F33',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#00A76F26',
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Tooltip>
          ) : (
            <Chip size="small" label={`+${names.length - max}`} sx={{ borderRadius: 1.5 }} />
          ))}
      </Box>
    );

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedAcademicYear) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedAcademicYear) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    faculties: (row: FormattedAcademicYear) =>
      renderChips(row.faculties, 1, () => setSelectedYearForFaculties(row)),
    semesters: (row: FormattedAcademicYear) => renderChips(row.semesters, 3),
    active: (row: FormattedAcademicYear) => {
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
          {t('add_year')}
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
                    <Iconify icon="solar:magnifer-linear" sx={{ color: '#919EAB' }} width={20} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          <Box sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <SelectField
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                select: { displayEmpty: true },
              }}
              sx={{
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
          </Box>
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
          <SharedTable<FormattedAcademicYear>
            data={formattedItems}
            count={totalCount || formattedItems.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      <AcademicYearFormDialog
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

      <Dialog
        open={!!selectedYearForFaculties}
        onClose={() => setSelectedYearForFaculties(null)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: '#00A76F14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00A76F',
              }}
            >
              <Iconify icon="solar:buildings-2-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                {t('faculties_dialog_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {isRtl ? selectedYearForFaculties?.nameAr : selectedYearForFaculties?.nameEn}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedYearForFaculties(null)} size="small">
            <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Stack spacing={1}>
            {selectedYearForFaculties?.faculties.map((name, idx) => (
              <Box
                key={`${name}-${idx}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#475569',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                    {name}
                  </Typography>
                </Box>
                <Iconify icon="solar:check-circle-bold" sx={{ color: '#00A76F', flexShrink: 0 }} width={18} />
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setSelectedYearForFaculties(null)}
            sx={{
              borderRadius: 2,
              borderColor: '#CBD5E1',
              color: '#1E293B',
              fontWeight: 600,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
