export type InvoiceType = 'Purchase' | 'WalletCharge' | string;

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
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
  currencyId?: string;
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

export interface GetInvoicesParams {
  Type?: string;
  FromDate?: string;
  ToDate?: string;
  CurrencyId?: string;
  CurrencyCode?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
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
  fromDate: string;
  toDate: string;
  currencyId: string;
}
