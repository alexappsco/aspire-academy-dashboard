export type SupportTicketStatus = 'pending' | 'replied';

export type StatusFilter = 'all' | SupportTicketStatus;

export type ApiSupportTicket = {
  id: string;
  number: number;
  title: string;
  description: string;
  status: SupportTicketStatus;
  reply: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  requestDate: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  reply: string | null;
  senderName?: string;
  senderType?: string;
  senderPhone?: string;
  senderEmail?: string;
};

export type SupportTicketFilters = {
  status?: SupportTicketStatus;
  name?: string;
  page?: number;
  limit?: number;
};

export type SupportTicketCounts = {
  all: number;
  pending: number;
  replied: number;
};

export function mapSupportTicket(apiTicket: ApiSupportTicket): SupportTicket {
  return {
    id: apiTicket.id,
    ticketNumber: String(apiTicket.number),
    requestDate: apiTicket.created_at.split('T')[0],
    title: apiTicket.title,
    description: apiTicket.description,
    status: apiTicket.status,
    reply: apiTicket.reply,
  };
}
