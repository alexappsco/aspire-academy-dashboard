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
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import Iconify from 'src/components/iconify';
import DateInput from 'src/components/DateInput/DateInput';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { useAuth } from 'src/contexts/AuthContext';

import {
  createInstructorContactUs,
  getContactUsMessages,
  getInstructorContactUsMessages,
} from 'src/actions/support';
import type { ContactUsMessageDto, GetContactUsMessagesParams } from 'src/types/support';
import CreateInstructorTicketDialog from './components/CreateInstructorTicketDialog';

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
  const { isInstructor, user } = useAuth();

  // Helper to normalize status to backend PascalCase enum ('New' | 'InProgress' | 'Resolved')
  const normalizeStatus = (st: unknown): 'New' | 'InProgress' | 'Resolved' => {
    if (st === null || st === undefined) return 'New';
    const s = String(st).toLowerCase().trim();
    if (s === '1' || s === '0' || s === 'new' || s === 'pending' || s === 'جديد') return 'New';
    if (
      s === '2' ||
      s === 'inprogress' ||
      s === 'in_progress' ||
      s === 'in progress' ||
      s === 'قيد المعالجة' ||
      s === 'جاري العمل'
    )
      return 'InProgress';
    if (s === '3' || s === 'resolved' || s === 'replied' || s === 'closed' || s === 'تم الرد' || s === 'تم الحل')
      return 'Resolved';
    return 'New';
  };

  // Read initial filter values from URL
  const rawUrlFilter = searchParams.get('Filter') || searchParams.get('search') || '';
  const rawUrlStatus = searchParams.get('Status') || searchParams.get('status') || 'all';
  const urlStatus = rawUrlStatus !== 'all' ? normalizeStatus(rawUrlStatus) : 'all';
  const rawUrlSenderType = searchParams.get('SenderType') || searchParams.get('senderType') || 'all';
  const urlSenderType =
    rawUrlSenderType === 'Student' || rawUrlSenderType === 'Instructor' ? rawUrlSenderType : 'all';
  const urlDate = searchParams.get('Date') || searchParams.get('date') || '';

  const [messages, setMessages] = useState<ContactUsMessageDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState(rawUrlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(rawUrlFilter);
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);
  const [senderTypeFilter, setSenderTypeFilter] = useState<string>(urlSenderType);
  const [dateFilter, setDateFilter] = useState<string>(urlDate);

  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      params.set('Status', normalizeStatus(statusFilter));
    } else {
      params.delete('Status');
      params.delete('status');
    }

    if (!isInstructor && senderTypeFilter && senderTypeFilter !== 'all') {
      params.set('SenderType', senderTypeFilter);
    } else {
      params.delete('SenderType');
      params.delete('senderType');
    }

    if (!isInstructor && dateFilter) {
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
  }, [debouncedSearch, statusFilter, senderTypeFilter, dateFilter, isInstructor, pathname, router, searchParams]);

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

        if (!isInstructor && senderTypeFilter && senderTypeFilter !== 'all') {
          params.SenderType = senderTypeFilter;
        }

        if (!isInstructor && dateFilter) {
          params.Date = dateFilter;
        }

        const res = isInstructor
          ? await getInstructorContactUsMessages(params)
          : await getContactUsMessages(params);

        if (res.success && res.data) {
          setMessages(res.data.items || []);
          setTotalCount(res.data.totalCount || 0);
        } else {
          if (res.error) {
            toast.error(res.error);
          }
        }
      } catch {
        toast.error('Failed to load messages');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, senderTypeFilter, dateFilter, isInstructor, toast]
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

  const handleCreateSubmit = async (values: {
    name: string;
    email: string;
    title: string;
    notes: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await createInstructorContactUs(values);
      if (res.success) {
        setCreateOpen(false);
        toast.success(t('ticket_sent'));
        setMessages([]);
        fetchMessagesData(true);
      } else {
        toast.error(res.error || t('ticket_send_failed'));
      }
    } catch {
      toast.error(t('ticket_send_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format date string cleanly (e.g. 2026-08-3)
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

  // Helper to format sender type
  const formatSenderType = (type?: unknown) => {
    if (type === null || type === undefined) {
      return isInstructor ? (isRtl ? 'محاضر' : 'Instructor') : isRtl ? 'طالب' : 'Student';
    }
    const s = String(type).toLowerCase().trim();
    if (s === '0' || s === 'student' || s === 'طالب') return isRtl ? 'طالب' : 'Student';
    if (s === '1' || s === 'lecturer' || s === 'instructor' || s === 'محاضر' || s === 'معلم')
      return isRtl ? 'محاضر' : 'Instructor';
    if (s === 'admin' || s === 'مسؤول') return isRtl ? 'مسؤول' : 'Admin';
    return String(type);
  };

  // Helper to render status badge matching design
  const renderStatusBadge = (status: unknown) => {
    const s = normalizeStatus(status);
    if (s === 'Resolved') {
      return (
        <Chip
          label={t('statuses.resolved')}
          sx={{
            fontWeight: 700,
            fontSize: 13,
            borderRadius: '8px',
            bgcolor: '#E6F4EA',
            color: '#00A76F',
            minWidth: 80,
            height: 30,
          }}
        />
      );
    }

    if (s === 'InProgress') {
      return (
        <Chip
          label={t('statuses.in_progress')}
          sx={{
            fontWeight: 700,
            fontSize: 13,
            borderRadius: '8px',
            bgcolor: '#E0F2FE',
            color: '#0284C7',
            minWidth: 80,
            height: 30,
          }}
        />
      );
    }

    // Default: New
    return (
      <Chip
        label={t('statuses.new')}
        sx={{
          fontWeight: 700,
          fontSize: 13,
          borderRadius: '8px',
          bgcolor: '#FEF3C7',
          color: '#D97706',
          minWidth: 80,
          height: 30,
        }}
      />
    );
  };

  const formattedMessages: FormattedSupportMessage[] = useMemo(() => {
    return messages.map((m, index) => {
      const name = String(m.name || m.userName || m.senderName || '-');
      const date = formatDateDisplay(m.creationTime || m.createdAt);
      const type = formatSenderType(m.senderType);
      const content = String(m.notes || m.title || m.message || '-');
      const normalizedSt = normalizeStatus(m.status);

      return {
        id: String(m.id || `row-${index}`),
        senderName: name,
        sendDate: date,
        senderType: type,
        complaintContent: content,
        status: normalizedSt,
        raw: m,
      };
    });
  }, [messages, isRtl, isInstructor]);

  // Client-side filtering secondary safeguard
  const filteredMessages = useMemo(() => {
    return formattedMessages.filter((item) => {
      const search = debouncedSearch.trim().toLowerCase();
      if (search) {
        const matches =
          item.senderName.toLowerCase().includes(search) ||
          item.complaintContent.toLowerCase().includes(search) ||
          item.senderType.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (statusFilter && statusFilter !== 'all') {
        const filterSt = normalizeStatus(statusFilter).toLowerCase();
        const itemSt = normalizeStatus(item.status).toLowerCase();
        if (filterSt !== itemSt) return false;
      }

      if (!isInstructor && senderTypeFilter && senderTypeFilter !== 'all') {
        const itemType = String(item.raw.senderType ?? '').toLowerCase().trim();
        const filter = senderTypeFilter.toLowerCase().trim();
        const isStudentFilter = filter === 'student' || filter === '0';
        const isInstructorFilter = filter === 'instructor' || filter === 'lecturer' || filter === '1';

        const isItemStudent = itemType === 'student' || itemType === '0' || itemType === 'طالب';
        const isItemInstructor =
          itemType === 'instructor' || itemType === 'lecturer' || itemType === '1' || itemType === 'محاضر';

        if (isStudentFilter && !isItemStudent) return false;
        if (isInstructorFilter && !isItemInstructor) return false;
        if (!isStudentFilter && !isInstructorFilter && itemType !== filter) return false;
      }

      if (dateFilter) {
        const rawCreation = item.raw.creationTime || item.raw.createdAt || '';
        const rawDateOnly = rawCreation ? rawCreation.split('T')[0] : '';
        if (rawDateOnly && rawDateOnly !== dateFilter) return false;
      }

      return true;
    });
  }, [formattedMessages, debouncedSearch, statusFilter, senderTypeFilter, dateFilter, isInstructor]);

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
      width: 170,
    },
    {
      id: 'sendDate',
      label: isRtl ? 'تاريخ الارسال' : 'Sent Date',
      align: cellAlignment.center,
      width: 140,
    },
    ...(!isInstructor
      ? [
          {
            id: 'senderType',
            label: isRtl ? 'نوع المرسل' : 'Sender Type',
            align: cellAlignment.center,
            width: 130,
          },
        ]
      : []),
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
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: 14 }}>
        {row.senderName}
      </Typography>
    ),
    sendDate: (row: FormattedSupportMessage) => (
      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: 14 }}>
        {row.sendDate}
      </Typography>
    ),
    senderType: (row: FormattedSupportMessage) => (
      <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: 14 }}>
        {row.senderType}
      </Typography>
    ),
    complaintContent: (row: FormattedSupportMessage) => (
      <Typography
        variant="body2"
        sx={{
          color: '#334155',
          maxWidth: 420,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 14,
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
          width: 36,
          height: 36,
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          color: '#64748B',
          bgcolor: '#FFFFFF',
          '&:hover': { bgcolor: '#F8FAFC', color: '#1E293B', borderColor: '#CBD5E1' },
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
          {isInstructor ? t('contact_us_title') : t('title')}
        </Typography>

        {isInstructor && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:plain-bold" />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: '#1C252E',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 700,
              px: 3,
              height: 44,
              gap: 1,
              boxShadow: '0 8px 16px 0 rgba(28, 37, 46, 0.24)',
              '&:hover': { bgcolor: '#212B36' },
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {t('send_ticket')}
          </Button>
        )}
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
        {/* Filter Bar (matching Image 1 exactly: Search, Date, Status dropdown) */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            p: 2.5,
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
              minWidth: { xs: '100%', sm: 260 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                height: 44,
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />

          {/* Date Filter (Admin only) */}
          {!isInstructor && (
            <DateInput
              size="small"
              placeholder={t('send_date')}
              value={dateFilter}
              onChange={setDateFilter}
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: 44,
                },
              }}
            />
          )}

          {/* Sender Type Dropdown (Admin only) */}
          {!isInstructor && (
            <Select
              size="small"
              value={senderTypeFilter}
              onChange={(e) => setSenderTypeFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected || selected === 'all') {
                  return (
                    <Box component="span" sx={{ color: '#64748B', fontWeight: 500 }}>
                      {t('sender_type')}
                    </Box>
                  );
                }
                if (selected === 'Student') return isRtl ? 'طالب' : 'Student';
                if (selected === 'Instructor') return isRtl ? 'محاضر' : 'Instructor';
                return selected;
              }}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                height: 44,
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                '& .MuiSelect-select': {
                  py: 1,
                  fontWeight: 500,
                },
                ...(isRtl ? { '& .MuiSelect-icon': { left: 10, right: 'auto' } } : {}),
              }}
            >
              <MenuItem value="all">{t('sender_type_all')}</MenuItem>
              <MenuItem value="Student">{isRtl ? 'طالب' : 'Student'}</MenuItem>
              <MenuItem value="Instructor">{isRtl ? 'محاضر' : 'Instructor'}</MenuItem>
            </Select>
          )}

          {/* Status Dropdown */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected || selected === 'all') {
                return (
                  <Box component="span" sx={{ color: '#64748B', fontWeight: 500 }}>
                    {t('status')}
                  </Box>
                );
              }
              if (selected === 'New') return t('statuses.new');
              if (selected === 'InProgress') return t('statuses.in_progress');
              if (selected === 'Resolved') return t('statuses.resolved');
              return selected;
            }}
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              height: 44,
              borderRadius: '8px',
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
              '& .MuiSelect-select': {
                py: 1,
                fontWeight: 500,
              },
              ...(isRtl ? { '& .MuiSelect-icon': { left: 10, right: 'auto' } } : {}),
            }}
          >
            <MenuItem value="all">{t('statuses.all_label')}</MenuItem>
            <MenuItem value="New">{t('statuses.new')}</MenuItem>
            <MenuItem value="InProgress">{t('statuses.in_progress')}</MenuItem>
            <MenuItem value="Resolved">{t('statuses.resolved')}</MenuItem>
          </Select>
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

      <CreateInstructorTicketDialog
        open={createOpen}
        submitting={submitting}
        defaultName={user?.name || ''}
        defaultEmail={user?.email || ''}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </Box>
  );
}
