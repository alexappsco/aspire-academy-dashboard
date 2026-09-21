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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Iconify from 'src/components/iconify';
import DateInput from 'src/components/DateInput';
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

function CountBadge({
  children,
  color,
  bgcolor,
}: {
  children: React.ReactNode;
  color?: string;
  bgcolor?: string;
}) {
  return (
    <Box
      component="span"
      sx={{
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        px: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        bgcolor: bgcolor || '#F1F3F5',
        color: color || '#1C252E',
      }}
    >
      {children}
    </Box>
  );
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
  // Backend Enum values: 1 = New, 2 = InProgress, 3 = Resolved
  const normalizeStatus = (st: unknown): string => {
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
    return String(st);
  };

  // Read initial filter values from URL
  const rawUrlFilter = searchParams.get('Filter') || searchParams.get('search') || '';
  const rawUrlStatus = searchParams.get('Status') || searchParams.get('status') || 'all';
  const urlStatus = rawUrlStatus !== 'all' ? normalizeStatus(rawUrlStatus) : 'all';
  const urlDate = searchParams.get('Date') || searchParams.get('date') || '';

  const [messages, setMessages] = useState<ContactUsMessageDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState(rawUrlFilter);
  const [debouncedSearch, setDebouncedSearch] = useState(rawUrlFilter);
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [dateFilter, setDateFilter] = useState(urlDate);

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
      } catch (err) {
        toast.error('Failed to load messages');
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [debouncedSearch, statusFilter, dateFilter, isInstructor, toast]
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

  // Helper to format sender type (handles enum numbers and strings)
  const formatSenderType = (type?: unknown) => {
    if (type === null || type === undefined) {
      return isInstructor ? (isRtl ? 'محاضر' : 'Instructor') : isRtl ? 'طالب' : 'Student';
    }
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
    if (s === 'Resolved') {
      return (
        <Chip
          label={t('statuses.resolved')}
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

    if (s === 'InProgress') {
      return (
        <Chip
          label={t('statuses.in_progress')}
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

    // Default: New
    return (
      <Chip
        label={t('statuses.new')}
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
    return messages.map((m, index) => {
      const name = String(m.name || m.senderName || m.fullName || m.userName || '-');
      const date = formatDateDisplay(m.creationTime || m.createdAt || m.created_at);
      const type = formatSenderType(m.senderType ?? m.userType);
      const content = String(m.notes || m.message || m.content || m.description || m.details || m.title || '-');
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

  // Client-side filtering as secondary safeguard
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

      if (dateFilter) {
        const rawCreation = item.raw.creationTime || item.raw.createdAt || '';
        const rawDateOnly = rawCreation ? rawCreation.split('T')[0] : '';
        if (rawDateOnly && rawDateOnly !== dateFilter) return false;
      }

      return true;
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

        {isInstructor && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:plain-bold" />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: '#886ce8',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 700,
              px: 3,
              height: 44,
              gap: 1,
              boxShadow: '0 8px 16px 0 rgba(136, 108, 232, 0.24)',
              '&:hover': { bgcolor: '#7758e6' },
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
        {/* Tabs for Status Filter */}
        <Box sx={{ px: 2, pt: 2, borderBottom: '1px solid #F1F3F5' }}>
          <Tabs
            value={statusFilter}
            onChange={(e, newValue) => setStatusFilter(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                bgcolor: '#1C252E',
              },
            }}
          >
            <Tab
              value="all"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2">{t('statuses.all')}</Typography>
                  <CountBadge
                    bgcolor={statusFilter === 'all' ? '#1C252E' : '#F1F3F5'}
                    color={statusFilter === 'all' ? '#fff' : '#1C252E'}
                  >
                    {totalCount}
                  </CountBadge>
                </Stack>
              }
            />
            <Tab
              value="Resolved"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2">{t('statuses.resolved')}</Typography>
                  <CountBadge bgcolor="#FFF5F8" color="#FF5630">
                    {formattedMessages.filter((m) => m.status === 'Resolved').length}
                  </CountBadge>
                </Stack>
              }
            />
            <Tab
              value="InProgress"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2">{t('statuses.in_progress')}</Typography>
                  <CountBadge bgcolor="#E0F2FE" color="#0284C7">
                    {formattedMessages.filter((m) => m.status === 'InProgress').length}
                  </CountBadge>
                </Stack>
              }
            />
            <Tab
              value="New"
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle2">{t('statuses.new')}</Typography>
                  <CountBadge bgcolor="#FEF3C7" color="#D97706">
                    {formattedMessages.filter((m) => m.status === 'New').length}
                  </CountBadge>
                </Stack>
              }
            />
          </Tabs>
        </Box>
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
            {/* Sent Date Filter (admin only) */}
            {!isInstructor && (
              <DateInput
                size="small"
                placeholder={t('send_date')}
                value={dateFilter}
                onChange={setDateFilter}
                sx={{ minWidth: 180 }}
              />
            )}
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
