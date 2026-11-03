'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/routing';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getErrorMessage } from 'src/utils/axios';

import {
  StudyMaterialDto,
  CreateStudyMaterialDto,
  GetStudyMaterialsParams,
} from 'src/types/study-material';
import {
  getStudyMaterialsAction,
  createStudyMaterialAction,
  updateStudyMaterialAction,
  deleteStudyMaterialAction,
} from 'src/actions/study-materials';
import SubjectFormDialog from './new-edit-subject-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedSubjectRow {
  id: string;
  nameAr: string;
  nameEn: string;
  placements: { label: string; missingYear: boolean }[];
  status: boolean;
  raw: StudyMaterialDto;
}

function extractStudyMaterialItems(res: unknown): { items: StudyMaterialDto[]; total: number } {
  if (!res) return { items: [], total: 0 };
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.items)) {
    return {
      items: r.items as StudyMaterialDto[],
      total: typeof r.totalCount === 'number' ? r.totalCount : r.items.length,
    };
  }
  if (r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.items)) {
      return {
        items: d.items as StudyMaterialDto[],
        total: typeof d.totalCount === 'number' ? d.totalCount : d.items.length,
      };
    }
    if (Array.isArray(r.data)) {
      return { items: r.data as StudyMaterialDto[], total: r.data.length };
    }
  }
  if (Array.isArray(res)) {
    return { items: res as StudyMaterialDto[], total: res.length };
  }
  return { items: [], total: 0 };
}

export default function SubjectsView() {
  const t = useTranslations('Subjects');
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

  const [materials, setMaterials] = useState<StudyMaterialDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterialDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSubjectForPlacements, setSelectedSubjectForPlacements] =
    useState<FormattedSubjectRow | null>(null);

  // 1. Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Sync active filters to URL cleanly without infinite loops
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

  // 3. Fetch data function
  const fetchData = useCallback(
    async (filterVal: string, statusVal: string, showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params: GetStudyMaterialsParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (filterVal.trim() !== '') {
          params.Filter = filterVal.trim();
        }

        if (statusVal === 'active') {
          params.IsActive = true;
        } else if (statusVal === 'inactive') {
          params.IsActive = false;
        }

        const res = await getStudyMaterialsAction(params);

        if (res.success && res.data) {
          const { items, total } = extractStudyMaterialItems(res.data);
          setMaterials(items);
          setTotalCount(total);
        } else if (res.error) {
          setMaterials([]);
          setTotalCount(0);
        }
      } catch (err: unknown) {
        toast.error(getErrorMessage(err));
        setMaterials([]);
        setTotalCount(0);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [toast]
  );

  // 4. Initial load & filter changes
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const params: GetStudyMaterialsParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (debouncedSearch.trim() !== '') {
          params.Filter = debouncedSearch.trim();
        }

        if (statusFilter === 'active') {
          params.IsActive = true;
        } else if (statusFilter === 'inactive') {
          params.IsActive = false;
        }

        const res = await getStudyMaterialsAction(params);

        if (!isMounted) return;

        if (res.success && res.data) {
          const { items, total } = extractStudyMaterialItems(res.data);
          setMaterials(items);
          setTotalCount(total);
        } else {
          setMaterials([]);
          setTotalCount(0);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        toast.error(getErrorMessage(err));
        setMaterials([]);
        setTotalCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, statusFilter, toast]);

  // Handlers for Add/Edit
  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (material: StudyMaterialDto) => {
    setEditingMaterial(material);
    setFormDialogOpen(true);
  };

  const handleSave = async (data: CreateStudyMaterialDto): Promise<boolean> => {
    try {
      if (editingMaterial) {
        const res = await updateStudyMaterialAction(editingMaterial.id, data);
        if (res.success) {
          toast.success(isRtl ? 'تم تحديث المادة الدراسية بنجاح' : 'Study material updated successfully');
          setMaterials((prev) =>
            prev.map((m) =>
              m.id === editingMaterial.id
                ? {
                    ...m,
                    nameAr: data.nameAr,
                    nameEn: data.nameEn,
                    isActive: data.isActive,
                  }
                : m
            )
          );
          fetchData(debouncedSearch, statusFilter, false);
          return true;
        }
        toast.error(res.error || (isRtl ? 'فشل تحديث المادة الدراسية' : 'Failed to update study material'));
        return false;
      }

      const res = await createStudyMaterialAction(data);
      if (res.success) {
        toast.success(isRtl ? 'تمت إضافة المادة الدراسية بنجاح' : 'Study material added successfully');
        if (res.data) {
          setMaterials((prev) => [res.data!, ...prev]);
          setTotalCount((prev) => prev + 1);
        }
        fetchData(debouncedSearch, statusFilter, false);
        return true;
      }
      toast.error(res.error || (isRtl ? 'فشل إضافة المادة الدراسية' : 'Failed to add study material'));
      return false;
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  // Handlers for Delete
  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteStudyMaterialAction(deletingId);
      if (res.success) {
        toast.success(isRtl ? 'تم حذف المادة بنجاح' : 'Subject deleted successfully');
        setMaterials((prev) => prev.filter((m) => m.id !== deletingId));
        setSelectedIds((prev) => prev.filter((id) => id !== deletingId));
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(res.error || (isRtl ? 'فشل حذف المادة' : 'Failed to delete subject'));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle status inline
  const handleToggleStatus = async (material: StudyMaterialDto) => {
    const placements = material.placements ?? [];
    // A migrated subject may still miss a year; the API needs full placements, so send the admin to the form.
    if (placements.length === 0 || placements.some((p) => !p.academicYearId)) {
      toast.error(t('dialog.placement_year_missing'));
      handleOpenEdit(material);
      return;
    }
    try {
      const updatedStatus = !material.isActive;
      // Optimistic update
      setMaterials((prev) =>
        prev.map((m) => (m.id === material.id ? { ...m, isActive: updatedStatus } : m))
      );

      const res = await updateStudyMaterialAction(material.id, {
        nameAr: material.nameAr,
        nameEn: material.nameEn,
        placements: placements.map((p) => ({
          facultyId: p.facultyId,
          academicYearId: p.academicYearId as string,
          semesterId: p.semesterId,
        })),
        isActive: updatedStatus,
      });

      if (res.success) {
        toast.success(isRtl ? 'تم تغيير الحالة بنجاح' : 'Status updated successfully');
      } else {
        // Revert
        setMaterials((prev) =>
          prev.map((m) => (m.id === material.id ? { ...m, isActive: material.isActive } : m))
        );
        toast.error(res.error || (isRtl ? 'فشل تغيير الحالة' : 'Failed to change status'));
      }
    } catch (err: unknown) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === material.id ? { ...m, isActive: material.isActive } : m))
      );
      toast.error(getErrorMessage(err));
    }
  };

  // Selection
  const isAllSelected = materials.length > 0 && selectedIds.length === materials.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < materials.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? materials.map((m) => m.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Table formatting
  const tableData: FormattedSubjectRow[] = materials.map((m) => ({
    id: m.id,
    nameAr: m.nameAr,
    nameEn: m.nameEn,
    placements: (m.placements ?? []).map((p) => ({
      label: [p.facultyName, p.academicYearName, p.semesterName].filter(Boolean).join(' · '),
      missingYear: !p.academicYearId,
    })),
    status: m.isActive,
    raw: m,
  }));

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
    { id: 'nameAr', label: t('dialog.name_ar'), align: cellAlignment.center },
    { id: 'nameEn', label: t('dialog.name_en'), align: cellAlignment.center },
    { id: 'placements', label: t('columns.placements'), align: cellAlignment.center },
    { id: 'status', label: t('columns.status'), align: cellAlignment.center, width: 140 },
    { id: 'actions', label: '', align: cellAlignment.center, width: 100 },
  ];

  const customRender = {
    checkbox: (row: FormattedSubjectRow) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    nameAr: (row: FormattedSubjectRow) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
        {row.nameAr}
      </Typography>
    ),
    nameEn: (row: FormattedSubjectRow) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748B' }}>
        {row.nameEn}
      </Typography>
    ),
    placements: (row: FormattedSubjectRow) =>
      row.placements.length === 0 ? (
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          -
        </Typography>
      ) : (
        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
          {row.placements.slice(0, 1).map((p, i) => (
            <Stack key={i} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                {p.label}
              </Typography>
              {p.missingYear && (
                <Chip size="small" color="warning" variant="outlined" label={t('columns.year_missing')} />
              )}
            </Stack>
          ))}
          {row.placements.length > 1 && (
            <Tooltip title={t('view_all_placements')}>
              <Chip
                label={`+${row.placements.length - 1}`}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSubjectForPlacements(row);
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
          )}
        </Stack>
      ),
    status: (row: FormattedSubjectRow) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Switch
          checked={row.status}
          onChange={() => handleToggleStatus(row.raw)}
          color="success"
          size="small"
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
    actions: (row: FormattedSubjectRow) => (
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
          onClick={() => handleOpenEdit(row.raw)}
          sx={{ color: '#637381' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Box>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* 1. Header: Title on Right, Add Button on Left in RTL */}
      <Stack
        direction="row"
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
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

      {/* 2. Main Card with Filters & Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Filters: Search on Right, Status on Left in RTL */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            borderBottom: '1px dashed #F1F3F5',
            alignItems: 'center',
          }}
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
              slotProps={{ select: { displayEmpty: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            >
              <MenuItem value="all">{t('statuses.all')}</MenuItem>
              <MenuItem value="active">{t('statuses.active')}</MenuItem>
              <MenuItem value="inactive">{t('statuses.inactive')}</MenuItem>
            </SelectField>
          </Box>
        </Stack>

        {/* Table / Loading */}
        <Box sx={{ px: 1, py: 1 }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 280,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : (
            <SharedTable<FormattedSubjectRow>
              tableHead={tableHead}
              data={tableData}
              count={totalCount}
              customRender={customRender}
            />
          )}
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <SubjectFormDialog
        key={editingMaterial?.id ?? 'new'}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingMaterial}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        open={!!selectedSubjectForPlacements}
        onClose={() => setSelectedSubjectForPlacements(null)}
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
              <Iconify icon="solar:diploma-verified-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                {t('placements_dialog_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {isRtl
                  ? selectedSubjectForPlacements?.nameAr
                  : selectedSubjectForPlacements?.nameEn}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedSubjectForPlacements(null)} size="small">
            <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Stack spacing={1}>
            {selectedSubjectForPlacements?.placements.map((placement, idx) => (
              <Box
                key={`${placement.label}-${idx}`}
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
                    {placement.label}
                  </Typography>
                </Box>
                {placement.missingYear ? (
                  <Chip size="small" color="warning" variant="outlined" label={t('columns.year_missing')} />
                ) : (
                  <Iconify icon="solar:check-circle-bold" sx={{ color: '#00A76F', flexShrink: 0 }} width={18} />
                )}
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setSelectedSubjectForPlacements(null)}
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
