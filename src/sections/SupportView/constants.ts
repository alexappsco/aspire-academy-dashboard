import type { StatusFilter, SupportTicket, SupportTicketStatus } from './types';

export const TABLE_HEAD = [
  { id: 'ticketNumber', label: 'رقم التذكرة', align: 'right', width: '20%' },
  { id: 'requestDate', label: 'تاريخ الطلب', align: 'right', width: '20%' },
  { id: 'title', label: 'العنوان', align: 'right', width: '40%' },
  { id: 'status', label: 'حالة الطلب', align: 'center', width: '20%' },
];

export const DEFAULT_PAGE_SIZE = 10;

export const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  pending: 'قيد المراجعة',
  replied: 'تم الرد',
};

export const STATUS_STYLES: Record<
  SupportTicketStatus,
  { label: string; bgcolor: string; color: string }
> = {
  replied: {
    label: STATUS_LABELS.replied,
    bgcolor: 'rgba(76, 175, 80, 0.12)',
    color: 'rgb(56, 142, 60)',
  },
  pending: {
    label: STATUS_LABELS.pending,
    bgcolor: 'rgba(255, 193, 7, 0.16)',
    color: 'rgb(183, 129, 3)',
  },
};

export function getStatusTabs(counts: { all: number; pending: number; replied: number }) {
  return [
    {
      label: 'الكل',
      value: 'all' as StatusFilter,
      count: counts.all,
      bgColor: '#1f2937',
      textColor: '#fff',
    },
    {
      label: STATUS_LABELS.replied,
      value: 'replied' as StatusFilter,
      count: counts.replied,
      bgColor: '#d1fae5',
      textColor: '#059669',
    },
    {
      label: STATUS_LABELS.pending,
      value: 'pending' as StatusFilter,
      count: counts.pending,
      bgColor: 'rgba(255, 193, 7, 0.16)',
      textColor: 'rgb(183, 129, 3)',
    },
  ];
}

export function filterTicketsBySearch(
  tickets: SupportTicket[],
  searchQuery: string
): SupportTicket[] {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  if (!normalizedSearch) {
    return tickets;
  }

  return tickets.filter((ticket) => {
    const statusLabel = STATUS_LABELS[ticket.status];

    return (
      ticket.ticketNumber.toLowerCase().includes(normalizedSearch) ||
      ticket.requestDate.toLowerCase().includes(normalizedSearch) ||
      ticket.title.toLowerCase().includes(normalizedSearch) ||
      statusLabel.includes(normalizedSearch)
    );
  });
}
