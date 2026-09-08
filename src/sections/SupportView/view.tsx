'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'src/i18n/routing';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import DateInput from 'src/components/DateInput';
import SelectField from 'src/components/SelectField/SelectField';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';

import { getContactUsMessages } from 'src/actions/support';
import type { ContactUsMessageDto, GetContactUsMessagesParams } from 'src/types/support';

interface FormattedSupportMessage {
  id: string;
  senderName: string;
  sendDate: string;
  senderType: string;
  complaintContent: string;
  status: string;
  raw: ContactUsMessageDto;
}

export default function SupportView() {
  const t = useTranslations('Support');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial filter values from URL
  const urlFilter = searchParams.get('Filter') || searchParams.get('search') || '';
  const urlStatus = searchParams.get('Status') || searchParams.get('status') || 'all';
  const urlDate = searchParams.get('Date') || searchParams.get('date') || '';

  const [messages, setMessages] = useState<ContactUsMessageDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState(urlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(urlFilter);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [dateFilter, setDateFilter] = useState(urlDate);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Synchronize browser URL query parameters with active filters
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set('Filter', debouncedSearch.trim());
    } else {
      params.delete('Filter');
      params.delete('search');
    }

    if (statusFilter && statusFilter !== 'all') {
      params.set('Status', statusFilter);
    } else {
      params.delete('Status');
      params.delete('status');
    }

    if (dateFilter) {
      params.set('Date', dateFilter);
    } else {
      params.delete('Date');
      params.delete('date');
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const target = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(target, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, dateFilter, pathname, router, searchParams]);

  // Fetch contact us messages from Backend API
  const fetchMessagesData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const params: GetContactUsMessagesParams = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };

        if (debouncedSearch.trim()) {
          params.Filter = debouncedSearch.trim();
        }

        if (statusFilter && statusFilter !== 'all') {
          params.Status = statusFilter;
        }

        if (dateFilter) {
          params.Date = dateFilter;
        }

        const res = await getContactUsMessages(params);

        if (res.success && res.data) {
          setMessages(res.data.items || []);
          setTotalCount(res.data.totalCount || 0);
        } else {
          // Keep current or empty on error
          if (res.error) {
            toast.error(res.error);
          }
        }
      } catch (err) {
        toast.error('Failed to load contact us messages');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, dateFilter, toast]
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchMessagesData(true);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchMessagesData]);

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(messages.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper to format date string cleanly
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const clean = dateStr.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1]}-${parseInt(parts[2], 10)}`;
      }
      return clean;
    } catch {
      return dateStr;
    }
  };

  // Helper to normalize status (handles enum numbers 0,1,2 and string formats)
  const normalizeStatus = (st: unknown): string => {
    if (st === null || st === undefined) return 'new';
    const s = String(st).toLowerCase().trim();
    if (s === '0' || s === 'new' || s === 'pending' || s === 'جديد') return 'new';
    if (s === '1' || s === 'in_progress' || s === 'inprogress' || s === 'in progress' || s === 'قيد المعالجة' || s === 'جاري العمل')
      return 'in_progress';
    if (s === '2' || s === 'resolved' || s === 'replied' || s === 'تم الرد' || s === 'تم الحل')
      return 'resolved';
    return s;
  };

  // Helper to format sender type (handles enum numbers and strings)
  const formatSenderType = (type?: unknown) => {
    if (type === null || type === undefined) return isRtl ? 'طالب' : 'Student';
    const s = String(type).toLowerCase().trim();
    if (s === '0' || s === 'student' || s === 'طالب') return isRtl ? 'طالب' : 'Student';
    if (s === '1' || s === 'lecturer' || s === 'instructor' || s === 'محاضر' || s === 'معلم')
      return isRtl ? 'محاضر' : 'Lecturer';
    if (s === 'admin' || s === 'مسؤول') return isRtl ? 'مسؤول' : 'Admin';
    return String(type);
  };

  // Helper to render status badge safely
  const renderStatusBadge = (status: unknown) => {
    const s = normalizeStatus(status);
    if (s === 'resolved') {
      return (
        <Chip
          label={isRtl ? 'تم الرد' : 'Resolved'}
          sx={{
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 1.5,
            bgcolor: '#E6F4EA',
            color: '#00A76F',
            minWidth: 80,
            height: 30,
          }}
        />
      );
    }

    if (s === 'in_progress') {
      return (
        <Chip
          label={isRtl ? 'in progress' : 'In Progress'}
          sx={{
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 1.5,
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            minWidth: 80,
            height: 30,
          }}
        />
      );
    }

    // Default: new
    return (
      <Chip
        label={isRtl ? 'جديد' : 'New'}
        sx={{
          fontWeight: 700,
          fontSize: 13,
          borderRadius: 1.5,
          bgcolor: '#FEF3C7',
          color: '#D97706',
          minWidth: 80,
          height: 30,
        }}
      />
    );
  };

  const formattedMessages: FormattedSupportMessage[] = useMemo(() => {
    return messages.map((m) => {
      const name = String(m.senderName || m.name || m.fullName || '-');
      const date = formatDateDisplay(m.creationTime || m.createdAt || m.created_at);
      const type = formatSenderType(m.senderType ?? m.userType);
      const content = String(m.message || m.content || m.description || m.details || m.title || '-');
      const normalizedSt = normalizeStatus(m.status);

      return {
        id: String(m.id || Math.random()),
        senderName: name,
        sendDate: date,
        senderType: type,
        complaintContent: content,
        status: normalizedSt,
        raw: m,
      };
    });
  }, [messages, isRtl]);

  // Client-side filtering as secondary safeguard
  const filteredMessages = useMemo(() => {
    return formattedMessages.filter((item) => {
      const search = debouncedSearch.trim().toLowerCase();
      const matchesSearch =
        !search ||
        item.senderName.toLowerCase().includes(search) ||
        item.complaintContent.toLowerCase().includes(search) ||
        item.senderType.toLowerCase().includes(search);

      const filterSt = normalizeStatus(statusFilter);
      const matchesStatus =
        statusFilter === 'all' ||
        item.status === filterSt ||
        item.status === statusFilter;

      const rawCreation = item.raw.creationTime || item.raw.createdAt || '';
      const rawDateOnly = rawCreation ? rawCreation.split('T')[0] : '';
      const matchesDate = !dateFilter || rawDateOnly === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [formattedMessages, debouncedSearch, statusFilter, dateFilter]);

  const isAllSelected =
    filteredMessages.length > 0 && selectedIds.length === filteredMessages.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filteredMessages.length;

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
    {
      id: 'senderName',
      label: isRtl ? 'اسم المرسل' : 'Sender Name',
      align: (isRtl ? 'right' : 'left') as cellAlignment,
      width: 160,
    },
    {
      id: 'sendDate',
      label: isRtl ? 'تاريخ الارسال' : 'Sent Date',
      align: cellAlignment.center,
      width: 140,
    },
    {
      id: 'senderType',
      label: isRtl ? 'نوع المرسل' : 'Sender Type',
      align: cellAlignment.center,
      width: 130,
    },
    {
      id: 'complaintContent',
      label: isRtl ? 'محتوى الشكوى' : 'Complaint Content',
      align: (isRtl ? 'right' : 'left') as cellAlignment,
    },
    {
      id: 'status',
      label: isRtl ? 'الحالة' : 'Status',
      align: cellAlignment.center,
      width: 130,
    },
    {
      id: 'actions',
      label: '',
      align: cellAlignment.center,
      width: 80,
    },
  ];

  const customRender = {
    checkbox: (row: FormattedSupportMessage) => (
      <Checkbox
        checked={selectedIds.includes(row.id)}
        onChange={() => handleToggleSelect(row.id)}
        size="small"
      />
    ),
    senderName: (row: FormattedSupportMessage) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
        {row.senderName}
      </Typography>
    ),
    sendDate: (row: FormattedSupportMessage) => (
      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
        {row.sendDate}
      </Typography>
    ),
    senderType: (row: FormattedSupportMessage) => (
      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
        {row.senderType}
      </Typography>
    ),
    complaintContent: (row: FormattedSupportMessage) => (
      <Typography
        variant="body2"
        sx={{
          color: '#334155',
          maxWidth: 380,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {row.complaintContent}
      </Typography>
    ),
    status: (row: FormattedSupportMessage) => renderStatusBadge(row.status),
    actions: (row: FormattedSupportMessage) => (
      <IconButton
        aria-label="view"
        onClick={() => router.push(`/support/${row.id}`)}
        sx={{
          color: '#64748B',
          '&:hover': { bgcolor: '#F1F5F9', color: '#1E293B' },
        }}
      >
        <Iconify icon="solar:eye-outline" width={20} />
      </IconButton>
    ),
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Title */}
      <Stack
        direction="row"
        sx={{
          mb: 3,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>
      </Stack>

      {/* Main Table Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Filter bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
            borderBottom: '1px dashed #F1F3F5',
            alignItems: 'center',
          }}
        >
          {/* Search field */}
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
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            {/* Sent Date Filter */}
            <DateInput
              size="small"
              placeholder={t('send_date')}
              value={dateFilter}
              onChange={setDateFilter}
              sx={{ minWidth: 180 }}
            />

            {/* Status Filter */}
            <SelectField
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                select: { displayEmpty: true },
              }}
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                },
              }}
            >
              <MenuItem value="all">{t('statuses.all')}</MenuItem>
              <MenuItem value="new">{t('statuses.new')}</MenuItem>
              <MenuItem value="in_progress">{t('statuses.in_progress')}</MenuItem>
              <MenuItem value="resolved">{t('statuses.resolved')}</MenuItem>
            </SelectField>
          </Stack>
        </Stack>

        {/* Table List */}
        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedSupportMessage>
            data={filteredMessages}
            count={totalCount || filteredMessages.length}
            tableHead={tableHead}
            customRender={customRender}
          />
        </Box>
      </Card>
    </Box>
  );
}
