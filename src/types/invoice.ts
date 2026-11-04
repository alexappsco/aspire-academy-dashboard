export type InvoiceType = 'course_purchase' | 'private_charge';
export type InvoiceStatus = 'issued' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  studentCountry: string;
  type: InvoiceType;
  typeLabel: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  statusLabel: string;
  serviceDescription: string;
  taxRatePercent: number;
  discount: number;
  paymentStatus: string;
  transactionNumber: string;
  approvalDate: string;
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
