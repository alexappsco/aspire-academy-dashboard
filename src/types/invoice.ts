export type InvoiceType = 'Purchase' | 'PrivateCharge' | string;
export type InvoiceStatus = 'Issued' | 'Cancelled' | string;

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  type: string;
  typeLabel?: string;
  status: string;
  statusLabel?: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  issuedAt: string;
  amountBeforeTax: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currencyCode: string;

  // Detail preview fields (used by preview page)
  studentId?: string;
  studentCountry?: string;
  serviceDescription?: string;
  taxRatePercent?: number;
  paymentStatus?: string;
  transactionNumber?: string;
  approvalDate?: string;
}

export interface InvoiceListResponse {
  items: InvoiceItem[];
  totalCount: number;
}

export interface InvoiceKpiSummary {
  totalInvoicesCount: number;
  totalInvoicesAmount: number;
  thisMonthInvoicesCount: number;
  totalTaxesAmount: number;
}

export interface InvoiceFilterState {
  search: string;
  type: string;
  status: string;
}
