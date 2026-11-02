'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import {
  getInstructors,
  deleteInstructor,
  verifyInstructor,
  rejectInstructor,
  bulkDeleteInstructors,
  bulkActivateInstructors,
  bulkDeactivateInstructors,
} from 'src/actions/instructors';
import { getSpecializations } from 'src/actions/specializations';
import type { Instructor, GetInstructorsParams } from 'src/types/instructor';
import type { Specialization } from 'src/types/specialization';

import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedInstructor {
  id: string;
  checkbox?: string;
  name: string;
  email: string;
  imageUrl: string;
  title: string;
  qualification: string;
  country: string;
  university: string;
  joinedDate: string;
  verified: boolean;
  actions?: string;
  raw?: Instructor;
}

function formatDate(date?: string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function MinutesManagementView() {
  const t = useTranslations('MinutesManagement');
  const toast = useToast();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRtl = locale === 'ar';

  const [items, setItems] = useState<Instructor[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Read initial filter values from URL
  const urlFilter = searchParams.get('Filter') || '';
  const urlIsVerified = searchParams.get('IsVerified');
  const initialStatus =
    urlIsVerified === 'true' ? 'verified' : urlIsVerified === 'false' ? 'rejected' : 'all';
  const urlSpecialization = searchParams.get('SpecializationId') || 'all';

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [specializationFilter, setSpecializationFilter] = useState(urlSpecialization);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Sync browser URL parameters with current active filters
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set('Filter', debouncedSearch.trim());
    } else {
      params.delete('Filter');
    }

    if (statusFilter === 'verified') {
      params.set('IsVerified', 'true');
    } else if (statusFilter === 'rejected') {
      params.set('IsVerified', 'false');
    } else {
      params.delete('IsVerified');
    }

    if (specializationFilter !== 'all') {
      params.set('SpecializationId', specializationFilter);
    } else {
      params.delete('SpecializationId');
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, specializationFilter, pathname, router, searchParams]);

  useEffect(() => {
    getSpecializations({ MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) setSpecializations(res.data.items);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInstructors() {
      try {
        const params: GetInstructorsParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };
        if (statusFilter === 'verified') params.IsVerified = true;
        if (statusFilter === 'rejected') params.IsVerified = false;
        if (debouncedSearch.trim()) params.Filter = debouncedSearch.trim();
        if (specializationFilter !== 'all') params.SpecializationId = specializationFilter;

        const res = await getInstructors(params);

        if (!isMounted) return;

        if (res.success && res.data) {
          setItems(res.data.items);
          setTotalCount(res.data.totalCount);
        } else {
          toast.error(res.error || 'Failed to load');
        }
      } catch {
        if (isMounted) {
          toast.error('Failed to load');
        }
      }
    }

    loadInstructors();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, statusFilter, specializationFilter, toast]);

  const handleOpenEdit = (row: FormattedInstructor) => {
    router.push(`/${locale}/minutes-management/${row.id}`);
  };

  const handleOpenDelete = (row: FormattedInstructor) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await deleteInstructor(deletingId);

      if (res.success) {
        toast.success(t('messages.delete_success'));
        setItems((prev) => prev.filter((i) => i.id !== deletingId));
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

  const verifiedCount = items.filter((i) => !!i.verifiedAt).length;
  const inactiveCount = items.filter((i) => !i.verifiedAt).length;

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) => items.some((item) => item.id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [items]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0 || bulkLoading) return;
    const ids = [...selectedIds];
    setBulkLoading('activate');
    try {
      const res = await bulkActivateInstructors(ids);
      if (!res.success) {
        toast.error(res.error || t('bulk.error'));
        return;
      }
      setItems((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, isActive: true } : item))
      );
      setSelectedIds([]);
      toast.success(t('bulk.activate_success', { count: ids.length }));
    } catch {
      toast.error(t('bulk.error'));
    } finally {
      setBulkLoading(null);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0 || bulkLoading) return;
    const ids = [...selectedIds];
    setBulkLoading('deactivate');
    try {
      const res = await bulkDeactivateInstructors(ids);
      if (!res.success) {
        toast.error(res.error || t('bulk.error'));
        return;
      }
      setItems((prev) =>
        prev.map((item) => (ids.includes(item.id) ? { ...item, isActive: false } : item))
      );
      setSelectedIds([]);
      toast.warning(t('bulk.deactivate_success', { count: ids.length }));
    } catch {
      toast.error(t('bulk.error'));
    } finally {
      setBulkLoading(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0 || bulkLoading) return;
    const ids = [...selectedIds];
    setBulkLoading('delete');
    try {
      const res = await bulkDeleteInstructors(ids);
      if (!res.success) {
        toast.error(res.error || t('bulk.error'));
        return;
      }
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
      setTotalCount((prev) => Math.max(0, prev - ids.length));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      toast.success(t('bulk.delete_success', { count: ids.length }));
    } catch {
      toast.error(t('bulk.error'));
    } finally {
      setBulkLoading(null);
    }
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const indeterminate = selectedIds.length > 0 && selectedIds.length < items.length;

  const tableHead = [
    {
      id: 'checkbox',
      label: (
        <Checkbox
          checked={allSelected}
          indeterminate={indeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          size="small"
        />
      ),
      align: cellAlignment.center,
      width: 48,
    },
    { id: 'name', label: t('columns.name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'title', label: t('columns.title'), align: 'center' as cellAlignment },
    { id: 'qualification', label: t('columns.qualification'), align: 'center' as cellAlignment },
    { id: 'country', label: t('columns.country'), align: 'center' as cellAlignment },
    { id: 'university', label: t('columns.university'), align: 'center' as cellAlignment },
    { id: 'joinedDate', label: t('columns.joined_date'), align: 'center' as cellAlignment },
    { id: 'verified', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const handleOpenDetails = (row: FormattedInstructor) => {
    router.push(`/${locale}/instructors/${row.id}`);
  };

  const actions = [
    {
      label: 'عرض الملف الشخصي',
      icon: <Iconify icon="solar:user-bold" />,
      onClick: (row: FormattedInstructor) => handleOpenDetails(row),
    },
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedInstructor) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedInstructor) => handleOpenDelete(row),
    },
  ];

  const tableData: FormattedInstructor[] = items.map((item) => {
    const countryName = isRtl
      ? item.country?.nameAr ?? item.country?.name ?? '-'
      : item.country?.nameEn ?? item.country?.name ?? '-';
    const universityName = isRtl ? item.university?.nameAr : item.university?.nameEn;

    return {
      id: item.id,
      name: item.name,
      email: item.email,
      imageUrl: item.imageUrl ?? '',
      title: item.title ?? '-',
      qualification: item.educationalQualification ?? '-',
      country: countryName,
      university: universityName ?? '-',
      joinedDate: formatDate(item.startJobAt),
      verified: !!item.verifiedAt,
      raw: item,
    };
  });

  const handleToggleStatus = async (row: FormattedInstructor) => {
    const isCurrentlyVerified = row.verified;
    const instructorId = row.id;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === instructorId
          ? {
              ...item,
              verifiedAt: isCurrentlyVerified ? null : new Date().toISOString(),
              rejectedAt: isCurrentlyVerified ? new Date().toISOString() : null,
            }
          : item
      )
    );

    try {
      const res = isCurrentlyVerified
        ? await rejectInstructor(instructorId)
        : await verifyInstructor(instructorId);

      if (res.success && res.data) {
        toast.success(t('toast.status_updated'));
        setItems((prev) =>
          prev.map((item) => (item.id === instructorId ? { ...item, ...res.data } : item))
        );
      } else {
        // Revert on error
        setItems((prev) =>
          prev.map((item) =>
            item.id === instructorId
              ? {
                  ...item,
                  verifiedAt: isCurrentlyVerified ? (item.verifiedAt || new Date().toISOString()) : null,
                  rejectedAt: isCurrentlyVerified ? null : (item.rejectedAt || new Date().toISOString()),
                }
              : item
          )
        );
        toast.error(res.error || 'فشل تحديث الحالة');
      }
    } catch (error) {
      // Revert on error
      setItems((prev) =>
        prev.map((item) =>
          item.id === instructorId
            ? {
                ...item,
                verifiedAt: isCurrentlyVerified ? (item.verifiedAt || new Date().toISOString()) : null,
                rejectedAt: isCurrentlyVerified ? null : (item.rejectedAt || new Date().toISOString()),
              }
            : item
        )
      );
      toast.error(error instanceof Error ? error.message : 'فشل تحديث الحالة');
    }
  };

  const customRender = {
    checkbox: (row: FormattedInstructor) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onClick={(e) => handleSelectOne(row.id, e)}
        size="small"
      />
    ),
    name: (row: FormattedInstructor) => (
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        onClick={() => handleOpenDetails(row)}
      >
        <Avatar
          src={row.imageUrl}
          alt={row.name}
          sx={{ width: 40, height: 40, bgcolor: '#E2F0D9' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#1C252E',
              '&:hover': { color: '#008767', textDecoration: 'underline' },
            }}
          >
            {row.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#919EAB', fontSize: '12px' }}>
            {row.email}
          </Typography>
        </Box>
      </Box>
    ),
    title: (row: FormattedInstructor) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.title}
      </Typography>
    ),
    qualification: (row: FormattedInstructor) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.qualification}
      </Typography>
    ),
    country: (row: FormattedInstructor) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.country}
      </Typography>
    ),
    university: (row: FormattedInstructor) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.university}
      </Typography>
    ),
    joinedDate: (row: FormattedInstructor) => (
      <Typography variant="body2" sx={{ color: '#1C252E', fontSize: '13px', fontWeight: 500 }}>
        {row.joinedDate}
      </Typography>
    ),
    verified: (row: FormattedInstructor) => {
      const isVerified = row.verified;
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
          <Switch
            checked={isVerified}
            onChange={() => handleToggleStatus(row)}
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
              color: isVerified ? '#00A76F' : '#64748B',
            }}
          >
            {isVerified ? t('status.active') : t('status.inactive')}
          </Typography>
        </Box>
      );
    },
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            {t('subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          href={`/${locale}/minutes-management/new`}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: '10px',
            px: 2.5,
            py: 1.2,
            gap: 1,
            fontWeight: 700,
            fontSize: '14px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#0F172A' },
          }}
        >
          <Iconify icon="mingcute:add-line" width={20} />
          {t('add_minutes')}
        </Button>
      </Box>

      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #F1F5F9',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Status Filter Tabs */}
        <Box sx={{ borderBottom: '1px solid #F1F5F9', px: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => setStatusFilter('all')}
              sx={{
                fontWeight: 700,
                color: statusFilter === 'all' ? '#1C252E' : '#637381',
                textTransform: 'none',
                borderBottom: statusFilter === 'all' ? '3px solid #1C252E' : '3px solid transparent',
                borderRadius: 0,
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('statuses.all')}</span>
                <Chip
                  label={totalCount}
                  size="small"
                  sx={{
                    bgcolor: statusFilter === 'all' ? '#1C252E' : '#EDF2F7',
                    color: statusFilter === 'all' ? '#FFF' : '#637381',
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Button>
            <Button
              onClick={() => setStatusFilter('verified')}
              sx={{
                fontWeight: 700,
                color: statusFilter === 'verified' ? '#1C252E' : '#637381',
                textTransform: 'none',
                borderBottom: statusFilter === 'verified' ? '3px solid #1C252E' : '3px solid transparent',
                borderRadius: 0,
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('status.active')}</span>
                <Chip
                  label={verifiedCount}
                  size="small"
                  sx={{
                    bgcolor: '#D2F9E5',
                    color: '#118D57',
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Button>
            <Button
              onClick={() => setStatusFilter('rejected')}
              sx={{
                fontWeight: 700,
                color: statusFilter === 'rejected' ? '#1C252E' : '#637381',
                textTransform: 'none',
                borderBottom: statusFilter === 'rejected' ? '3px solid #1C252E' : '3px solid transparent',
                borderRadius: 0,
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{t('status.inactive')}</span>
                <Chip
                  label={inactiveCount}
                  size="small"
                  sx={{
                    bgcolor: '#EDF2F7',
                    color: '#637381',
                    height: 20,
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Button>
          </Box>
        </Box>

        {/* Filter Controls */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                height: '44px',
                fontSize: '14px',
                '& fieldset': { borderColor: '#E5E8EB' },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Specialization Filter */}
          <FormControl
            size="small"
            variant="outlined"
            sx={{ minWidth: { xs: '100%', sm: 180 }, flexShrink: 0 }}
          >
            <Select
              variant="outlined"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              displayEmpty
              sx={{
                height: '44px',
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1C252E',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: '1px solid #E5E8EB',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#919EAB',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#008767',
                  borderWidth: '1px',
                },
                '& .MuiSelect-icon': {
                  color: '#64748B',
                },
              }}
            >
              <MenuItem value="all">{t('filter_specialization_all')}</MenuItem>
              {specializations.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {isRtl ? s.nameAr || s.nameEn : s.nameEn || s.nameAr}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedIds.length > 0 && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              px: 2,
              pb: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#1C252E', minWidth: 88 }}>
              {t('bulk.selected', { count: selectedIds.length })}
            </Typography>
            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
            <Button
              variant="contained"
              disabled={Boolean(bulkLoading)}
              onClick={handleBulkActivate}
              startIcon={
                bulkLoading === 'activate' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:check-circle-bold" width={16} />
                )
              }
              sx={{
                borderRadius: '10px',
                bgcolor: '#00A76F',
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.75,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#008767', boxShadow: 'none' },
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              {bulkLoading === 'activate'
                ? t('bulk.working')
                : t('bulk.activate', { count: selectedIds.length })}
            </Button>
            <Button
              variant="outlined"
              disabled={Boolean(bulkLoading)}
              onClick={handleBulkDeactivate}
              startIcon={
                bulkLoading === 'deactivate' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:close-circle-bold" width={16} />
                )
              }
              sx={{
                borderRadius: '10px',
                color: '#B45309',
                borderColor: '#FDE68A',
                bgcolor: '#FFFBEB',
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.75,
                '&:hover': { borderColor: '#F59E0B', bgcolor: '#FEF3C7' },
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              {bulkLoading === 'deactivate'
                ? t('bulk.working')
                : t('bulk.deactivate', { count: selectedIds.length })}
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={Boolean(bulkLoading)}
              onClick={() => setBulkDeleteOpen(true)}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={16} />}
              sx={{
                borderRadius: '10px',
                bgcolor: '#D32F2F',
                fontWeight: 700,
                textTransform: 'none',
                gap: 0.75,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#C62828', boxShadow: 'none' },
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              {t('bulk.delete', { count: selectedIds.length })}
            </Button>
          </Stack>
        )}

        {/* Table */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedInstructor>
            data={tableData}
            count={totalCount}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        open={bulkDeleteOpen}
        onClose={() => {
          if (!bulkLoading) setBulkDeleteOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, p: 1 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, color: '#1C252E', pb: 1 }}>
          {t('bulk.delete_title')}
        </DialogTitle>
        <DialogContent sx={{ color: '#64748B', fontSize: 14 }}>
          {t('bulk.delete_content', { count: selectedIds.length })}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={bulkLoading === 'delete'}
            onClick={() => setBulkDeleteOpen(false)}
            sx={{ borderRadius: '10px', color: '#64748B', borderColor: '#E2E8F0', fontWeight: 600, textTransform: 'none' }}
          >
            {t('bulk.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmBulkDelete}
            disabled={bulkLoading === 'delete'}
            startIcon={
              bulkLoading === 'delete' ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Iconify icon="solar:trash-bin-trash-bold" width={16} />
              )
            }
            sx={{
              borderRadius: '10px',
              bgcolor: '#D32F2F',
              fontWeight: 700,
              textTransform: 'none',
              gap: 0.75,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#C62828', boxShadow: 'none' },
              '& .MuiButton-startIcon': { m: 0 },
            }}
          >
            {bulkLoading === 'delete' ? t('bulk.deleting') : t('bulk.confirm_delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
