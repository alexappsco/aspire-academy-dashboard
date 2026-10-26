'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';

import {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from 'src/actions/faculties';
import { getUniversitiesAction } from 'src/actions/unversity';
import type { Faculty, GetFacultiesParams } from 'src/types/faculty';
import type { UniversityDto } from 'src/sections/university/types';

import CollegeFormDialog from './new-edit-college-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedCollegeRow {
  id: string;
  logo: string;
  name: string;
  university: string;
  academicYears: { id: string; name: string }[];
  active: boolean;
  raw: Faculty;
}

export default function CollegeView() {
  const t = useTranslations('Colleges');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [universities, setUniversities] = useState<UniversityDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCollegeForYears, setSelectedCollegeForYears] = useState<FormattedCollegeRow | null>(null);

  // Debounce search input
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Load universities for filter dropdown
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await getUniversitiesAction({ MaxResultCount: 1000 });
        if (res.success && res.data?.items) {
          setUniversities(res.data.items);
        }
      } catch (err) {
        console.error('Failed to load universities for filter', err);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch faculties from backend
  const fetchFaculties = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params: GetFacultiesParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (statusFilter === 'active') params.IsActive = true;
        if (statusFilter === 'inactive') params.IsActive = false;
        if (universityFilter && universityFilter !== 'all') params.UniversityId = universityFilter;
        if (debouncedSearch.trim()) params.Filter = debouncedSearch.trim();

        const res = await getFaculties(params);
        if (res.success && res.data) {
          setFaculties(res.data.items);
          setTotalCount(res.data.totalCount);
        } else {
          toast.error(res.error || t('messages.load_error'));
          setFaculties([]);
          setTotalCount(0);
        }
      } catch {
        toast.error(t('messages.load_error'));
        setFaculties([]);
        setTotalCount(0);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [statusFilter, universityFilter, debouncedSearch, toast, t]
  );

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedCollegeRow) => {
    setEditingFaculty(row.raw);
    setDialogOpen(true);
  };

  const handleOpenDelete = (row: FormattedCollegeRow) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await deleteFaculty(deletingId);
      if (res.success) {
        toast.success(t('messages.delete_success'));
        setFaculties((prev) => prev.filter((c) => c.id !== deletingId));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setDeleteDialogOpen(false);
        setDeletingId(null);
      } else {
        toast.error(res.error || 'Failed to delete faculty');
      }
    } catch {
      toast.error('Failed to delete faculty');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveCollege = async (formData: FormData): Promise<boolean> => {
    try {
      if (editingFaculty) {
        const res = await updateFaculty(editingFaculty.id, formData);
        if (res.success) {
          toast.success(t('messages.edit_success'));
          await fetchFaculties(false);
          return true;
        }
        toast.error(res.error || 'Failed to update faculty');
        return false;
      }

      const res = await createFaculty(formData);
      if (res.success) {
        toast.success(t('messages.add_success'));
        await fetchFaculties(false);
        return true;
      }
      toast.error(res.error || 'Failed to create faculty');
      return false;
    } catch {
      toast.error(editingFaculty ? 'Failed to update faculty' : 'Failed to create faculty');
      return false;
    }
  };

  const handleToggleStatus = async (faculty: Faculty) => {
    const updatedStatus = !faculty.isActive;

    // Optimistic UI update
    setFaculties((prev) =>
      prev.map((c) => (c.id === faculty.id ? { ...c, isActive: updatedStatus } : c))
    );

    try {
      const formData = new FormData();
      formData.append('NameAr', faculty.nameAr);
      formData.append('NameEn', faculty.nameEn);
      formData.append('UniversityId', faculty.universityId);
      formData.append('IsActive', String(updatedStatus));

      if (faculty.academicYears && faculty.academicYears.length > 0) {
        faculty.academicYears.forEach((y) => {
          formData.append('AcademicYearIds', y.id);
        });
      }

      const res = await updateFaculty(faculty.id, formData);
      if (res.success) {
        toast.success(t('messages.status_updated'));
      } else {
        // Revert on failure
        setFaculties((prev) =>
          prev.map((c) => (c.id === faculty.id ? { ...c, isActive: faculty.isActive } : c))
        );
        toast.error(res.error || 'Failed to update status');
      }
    } catch {
      setFaculties((prev) =>
        prev.map((c) => (c.id === faculty.id ? { ...c, isActive: faculty.isActive } : c))
      );
      toast.error('Failed to update status');
    }
  };

  const formattedColleges: FormattedCollegeRow[] = faculties.map((item) => ({
    id: item.id,
    logo: item.imageUrl || '/icons/course.svg',
    name: isRtl ? item.nameAr : item.nameEn,
    university:
      item.university?.name ||
      (universities.find((u) => u.id === item.universityId)
        ? isRtl
          ? universities.find((u) => u.id === item.universityId)!.nameAr
          : universities.find((u) => u.id === item.universityId)!.nameEn
        : '-'),
    academicYears: item.academicYears ?? [],
    active: item.isActive,
    raw: item,
  }));

  const tableHead = [
    { id: 'logo', label: t('columns.image'), align: 'center' as cellAlignment },
    { id: 'name', label: t('columns.name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'university', label: t('columns.university'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'academicYears', label: t('columns.academic_years'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'active', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedCollegeRow) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedCollegeRow) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    logo: (row: FormattedCollegeRow) => (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          border: '1px solid #E2E8F0',
          borderRadius: 2,
          p: 0.5,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box
          component="img"
          src={row.logo}
          alt={row.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/course.svg';
          }}
        />
      </Box>
    ),
    name: (row: FormattedCollegeRow) => (
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B' }}>
          {isRtl ? row.raw.nameAr : row.raw.nameEn}
        </Typography>
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          {isRtl ? row.raw.nameEn : row.raw.nameAr}
        </Typography>
      </Box>
    ),
    university: (row: FormattedCollegeRow) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.university}
      </Typography>
    ),
    academicYears: (row: FormattedCollegeRow) => {
      if (!row.academicYears || row.academicYears.length === 0) {
        return (
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {t('no_academic_years')}
          </Typography>
        );
      }

      const visibleYears = row.academicYears.slice(0, 2);
      const remainingCount = row.academicYears.length - 2;

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'nowrap' }}>
          {visibleYears.map((year) => (
            <Chip
              key={year.id}
              label={year.name}
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                color: '#334155',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 1.5,
                maxWidth: 130,
              }}
            />
          ))}

          {remainingCount > 0 && (
            <Tooltip title={t('view_all_years')}>
              <Chip
                label={`+${remainingCount}`}
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCollegeForYears(row);
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
        </Box>
      );
    },
    active: (row: FormattedCollegeRow) => {
      const isActive = row.active;
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(row.raw)}
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
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            gap: 1,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          <Iconify icon="mingcute:add-line" width={20} />
          {t('add_college')}
        </Button>
      </Stack>

      {/* Main card containing filter row and table */}
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

          {/* University Filter */}
          <Box sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <SelectField
              fullWidth
              size="small"
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
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
              <MenuItem value="all">{t('all_universities')}</MenuItem>
              {universities.map((uni) => (
                <MenuItem key={uni.id} value={uni.id}>
                  {isRtl ? uni.nameAr : uni.nameEn}
                </MenuItem>
              ))}
            </SelectField>
          </Box>

          {/* Status Filter */}
          <Box sx={{ minWidth: { xs: '100%', sm: 160 } }}>
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

        {/* Table list */}
        <Box sx={{ px: 1, position: 'relative' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#1C252E' }} />
            </Box>
          ) : (
            <SharedTable<FormattedCollegeRow>
              data={formattedColleges}
              count={totalCount}
              tableHead={tableHead}
              actions={actions}
              customRender={customRender}
            />
          )}
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      {dialogOpen && (
        <CollegeFormDialog
          key={editingFaculty?.id ?? 'new'}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          initialData={editingFaculty}
          onSave={handleSaveCollege}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleteLoading) setDeleteDialogOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Academic Years Details Modal Dialog */}
      <Dialog
        open={!!selectedCollegeForYears}
        onClose={() => setSelectedCollegeForYears(null)}
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
                {t('years_dialog_title')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {selectedCollegeForYears?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedCollegeForYears(null)} size="small">
            <Iconify icon="ic:round-close" sx={{ color: '#64748B', width: 20, height: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Stack spacing={1}>
            {selectedCollegeForYears?.academicYears.map((year, idx) => (
              <Box
                key={year.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                    {year.name}
                  </Typography>
                </Box>
                <Iconify icon="solar:check-circle-bold" sx={{ color: '#00A76F' }} width={18} />
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setSelectedCollegeForYears(null)}
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
