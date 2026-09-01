'use client';

import { useMemo, useState } from 'react';
import { Box, Card, Chip, IconButton } from '@mui/material';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'src/i18n/routing';
import Iconify from 'src/components/iconify';
import SimpleTable from 'src/components/SimpleTable';
import SupportHeader from './components/SupportHeader';
import SupportSearchBar from './components/SupportSearchBar';
import SupportStatusTabs from './components/SupportStatusTabs';
import { STATUS_STYLES, TABLE_HEAD, DEFAULT_PAGE_SIZE } from './constants';
import { MOCK_TICKETS } from './_mock';
import type { StatusFilter, SupportTicket } from './types';

export default function SupportView() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Support");

  const [tickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredTickets = useMemo(() => {
    const query = searchInput.trim().toLowerCase();

    return tickets.filter((ticket) => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.requestDate.includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        t(ticket.status).toLowerCase().includes(query)
      );
    });
  }, [tickets, searchInput, statusFilter, t]);

  const counts = useMemo(() => ({
    all: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    replied: tickets.filter((t) => t.status === 'replied').length,
  }), [tickets]);

  const tabs = [
    {
      label: t("all"),
      value: 'all' as StatusFilter,
      count: counts.all,
      bgColor: '#1f2937',
      textColor: '#fff',
    },
    {
      label: t("replied"),
      value: 'replied' as StatusFilter,
      count: counts.replied,
      bgColor: '#d1fae5',
      textColor: '#059669',
    },
    {
      label: t("pending"),
      value: 'pending' as StatusFilter,
      count: counts.pending,
      bgColor: 'rgba(255, 193, 7, 0.16)',
      textColor: 'rgb(183, 129, 3)',
    },
  ];

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const customRender = {
    status: (row: SupportTicket) => {
      const status = STATUS_STYLES[row.status];

      return (
        <Chip
          label={t(row.status)}
          sx={{
            fontWeight: 600,
            borderRadius: '8px',
            bgcolor: status.bgcolor,
            color: status.color,
            border: 'none',
            minWidth: 96,
          }}
        />
      );
    },
  };

  const tableHead = useMemo(
    () => [
      ...TABLE_HEAD,
      {
        id: 'view',
        label: '',
        // align: 'center',
        width: 80,
        renderCell: (row: SupportTicket) => (
          <IconButton
            aria-label={t("view")}
            onClick={() => router.push(`/support/${row.id}`)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              color: '#475569',
              align: 'start',
              '&:hover': {
                bgcolor: '#F1F5F9',
                color: '#1E293B',
              },
            }}
          >
            <Iconify icon="solar:eye-outline" width={22} />
          </IconButton>
        ),
      },
    ],
    [router, t]
  );

  return (
    <Box sx={{ textAlign: locale === 'ar' ? 'right' : 'left' }}>
      <SupportHeader canAdd={false} />

      <Card
        sx={{
          borderRadius: '20px',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, bgcolor: '#fff' }}>
          <SupportStatusTabs
            tabs={tabs}
            activeFilter={statusFilter}
            onFilterChange={handleStatusFilterChange}
          />
          <SupportSearchBar value={searchInput} onChange={handleSearchChange} />
        </Box>

        <SimpleTable<SupportTicket>
          data={filteredTickets}
          headCells={tableHead}
          customRender={customRender}
          hidePagination={filteredTickets.length <= DEFAULT_PAGE_SIZE}
        />
      </Card>
    </Box>
  );
}
