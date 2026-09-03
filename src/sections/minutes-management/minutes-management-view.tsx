'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getInstructors, deleteInstructor } from 'src/actions/instructors';
import type { Instructor } from 'src/types/instructor';

import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedInstructor {
  id: string;
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
  const isRtl = locale === 'ar';

  const [items, setItems] = useState<Instructor[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadInstructors() {
      try {
        const params: Record<string, unknown> = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };
        if (statusFilter === 'verified') params.IsVerified = true;
        if (statusFilter === 'rejected') params.IsVerified = false;
        if (debouncedSearch.trim()) params.Filter = debouncedSearch.trim();

        const res = await getInstructors(params as {
          IsVerified?: boolean;
          Filter?: string;
          SkipCount?: number;
          MaxResultCount?: number;
        });

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
  }, [debouncedSearch, statusFilter, toast]);

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

  const verifiedCount = items.filter((i) => i.verifiedAt).length;
  const rejectedCount = items.filter((i) => i.rejectedAt && !i.verifiedAt).length;

  const tableHead = [
    { id: 'name', label: t('columns.name'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'title', label: t('columns.title'), align: 'center' as cellAlignment },
    { id: 'qualification', label: t('columns.qualification'), align: 'center' as cellAlignment },
    { id: 'country', label: t('columns.country'), align: 'center' as cellAlignment },
    { id: 'university', label: t('columns.university'), align: 'center' as cellAlignment },
    { id: 'joinedDate', label: t('columns.joined_date'), align: 'center' as cellAlignment },
    { id: 'verified', label: t('columns.status'), align: 'center' as cellAlignment },
  ];

  const actions = [
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

  const customRender = {
    name: (row: FormattedInstructor) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          src={row.imageUrl}
          alt={row.name}
          sx={{ width: 40, height: 40, bgcolor: '#E2F0D9' }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1C252E' }}>
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
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            size="small"
            label={isVerified ? t('status.active') : t('status.inactive')}
            sx={{
              bgcolor: isVerified ? '#D2F9E5' : '#EDF2F7',
              color: isVerified ? '#118D57' : '#637381',
              fontWeight: 600,
              fontSize: '12px',
            }}
          />
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
                  label={rejectedCount}
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
        </Box>

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
    </Box>
  );
}
