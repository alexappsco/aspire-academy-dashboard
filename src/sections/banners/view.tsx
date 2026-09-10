'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/routing';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import DateInput from 'src/components/DateInput';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';

import { getBanners, deleteBanner, updateBanner } from 'src/actions/banners';
import type { BannerDto, GetBannersParams } from 'src/types/banner';
import BannerFormDialog from './new-edit-banner-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedBanner {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
  order: number;
  externalUrl: string;
  startDate: string;
  endDate: string;
  active: boolean;
  raw: BannerDto;
}

export default function BannersView() {
  const t = useTranslations('Banners');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const toast = useToast();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const urlFilter = searchParams.get('Filter') || '';
  const urlIsActive = searchParams.get('IsActive');
  const initialStatus =
    urlIsActive === 'true' ? 'active' : urlIsActive === 'false' ? 'inactive' : 'all';
  const urlStartDate = searchParams.get('StartDate') || '';
  const urlEndDate = searchParams.get('EndDate') || '';

  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

    if (statusFilter === 'active') {
      params.set('IsActive', 'true');
    } else if (statusFilter === 'inactive') {
      params.set('IsActive', 'false');
    } else {
      params.delete('IsActive');
    }

    if (startDate) {
      params.set('StartDate', startDate);
    } else {
      params.delete('StartDate');
    }

    if (endDate) {
      params.set('EndDate', endDate);
    } else {
      params.delete('EndDate');
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, startDate, endDate, pathname, router, searchParams]);

  // Fetch banners from API
  const fetchBannersData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params: GetBannersParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (debouncedSearch.trim()) {
          params.Filter = debouncedSearch.trim();
        }

        if (statusFilter === 'active') {
          params.IsActive = true;
        } else if (statusFilter === 'inactive') {
          params.IsActive = false;
        }

        if (startDate) {
          params.StartDate = startDate;
        }

        if (endDate) {
          params.EndDate = endDate;
        }

        const res = await getBanners(params);

        if (res.success && res.data) {
          setBanners(res.data.items || []);
          setTotalCount(res.data.totalCount || 0);
        } else {
          toast.error(res.error || 'Failed to load banners');
        }
      } catch (err) {
        toast.error('Failed to load banners');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, startDate, endDate, toast]
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchBannersData(true);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchBannersData]);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedBanner) => {
    setEditingBanner(row.raw);
    setDialogOpen(true);
  };

  const handleOpenDelete = (row: FormattedBanner) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteBanner(deletingId);
      if (res.success) {
        toast.success('تم حذف البنر بنجاح');
        fetchBannersData(false);
      } else {
        toast.error(res.error || 'فشل في حذف البنر');
      }
    } catch {
      toast.error('فشل في حذف البنر');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async (banner: BannerDto) => {
    try {
      const newStatus = !banner.isActive;
      // Optimistic update
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: newStatus } : b))
      );
      const res = await updateBanner(banner.id, {
        nameAr: banner.nameAr,
        nameEn: banner.nameEn,
        isActive: newStatus,
        order: banner.order,
        startAt: banner.startAt,
        endAt: banner.endAt,
        externalUrl: banner.externalUrl,
      });

      if (res.success) {
        toast.success('تم تحديث حالة البنر بنجاح');
      } else {
        toast.error(res.error || 'فشل في تحديث حالة البنر');
        fetchBannersData(false);
      }
    } catch {
      toast.error('فشل في تحديث حالة البنر');
      fetchBannersData(false);
    }
  };

  const formatDateDDMMYYYY = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '-';
    }
  };

  const formattedBanners: FormattedBanner[] = banners.map((item) => {
    return {
      id: item.id,
      nameAr: item.nameAr || '',
      nameEn: item.nameEn || '',
      image: item.imageUrl || '/icons/package.svg',
      order: item.order ?? 0,
      externalUrl: item.externalUrl || '',
      startDate: formatDateDDMMYYYY(item.startAt),
      endDate: formatDateDDMMYYYY(item.endAt),
      active: item.isActive,
      raw: item,
    };
  });

  const filteredBanners = formattedBanners.filter((item) => {
    const rawStart = item.raw.startAt ? item.raw.startAt.split('T')[0] : '';
    const rawEnd = item.raw.endAt ? item.raw.endAt.split('T')[0] : '';

    const matchesSearch =
      !searchQuery.trim() ||
      item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.externalUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStartDate = !startDate || rawStart >= startDate;
    const matchesEndDate = !endDate || rawEnd <= endDate;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const tableHead = [
    { id: 'image', label: isRtl ? 'الصورة' : 'Image', align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'nameAr', label: isRtl ? 'الاسم (عربي)' : 'Name (Arabic)', align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'nameEn', label: isRtl ? 'الاسم (إنجليزي)' : 'Name (English)', align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'order', label: isRtl ? 'الترتيب' : 'Order', align: 'center' as cellAlignment },
    { id: 'externalUrl', label: isRtl ? 'الرابط الخارجي' : 'External Link', align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'startDate', label: isRtl ? 'تاريخ البدء' : 'Start Date', align: 'center' as cellAlignment },
    { id: 'endDate', label: isRtl ? 'تاريخ الانتهاء' : 'End Date', align: 'center' as cellAlignment },
    { id: 'active', label: isRtl ? 'الحالة' : 'Status', align: 'center' as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedBanner) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedBanner) => handleOpenDelete(row),
    },
  ];

  const customRender = {
    image: (row: FormattedBanner) => (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 48,
          border: '1px solid #E2E8F0',
          borderRadius: 1.5,
          p: 0.5,
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        <img
          src={row.image}
          alt={row.nameAr}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/package.svg';
          }}
        />
      </Box>
    ),
    nameAr: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
        {row.nameAr || '-'}
      </Typography>
    ),
    nameEn: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ fontWeight: 500, color: '#64748B' }}>
        {row.nameEn || '-'}
      </Typography>
    ),
    order: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
        {row.order ?? 0}
      </Typography>
    ),
    externalUrl: (row: FormattedBanner) => {
      if (!row.externalUrl) {
        return (
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            -
          </Typography>
        );
      }
      return (
        <Box
          component="a"
          href={row.externalUrl.startsWith('http') ? row.externalUrl : `https://${row.externalUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#0284C7',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <Iconify icon="eva:external-link-outline" width={16} sx={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.externalUrl}</span>
        </Box>
      );
    },
    startDate: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.startDate}
      </Typography>
    ),
    endDate: (row: FormattedBanner) => (
      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500 }}>
        {row.endDate}
      </Typography>
    ),
    active: (row: FormattedBanner) => {
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
            {isActive ? (isRtl ? 'نشط' : 'Active') : (isRtl ? 'معطل' : 'Inactive')}
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
          {t('add_banner')}
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 500 } }}>
            <DateInput
              fullWidth
              size="small"
              placeholder={t('start_date')}
              value={startDate}
              onChange={setStartDate}
            />

            <DateInput
              fullWidth
              size="small"
              placeholder={t('end_date')}
              value={endDate}
              onChange={setEndDate}
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
        </Stack>

        {/* Table list */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedBanner>
            data={filteredBanners}
            count={totalCount || filteredBanners.length}
            tableHead={tableHead}
            actions={actions}
            customRender={customRender}
          />
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <BannerFormDialog
        key={editingBanner?.id ?? 'new'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialData={editingBanner}
        onSuccess={() => fetchBannersData(false)}
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

