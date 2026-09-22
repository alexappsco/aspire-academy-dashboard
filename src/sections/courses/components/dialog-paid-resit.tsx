'use client';

export { default } from 'src/sections/students/PaymentReceiptDialog';
export type { PaymentReceiptDialogProps } from 'src/sections/students/PaymentReceiptDialog';

export interface PaymentReceiptData {
  refNumber?: string;
  receiptUrl?: string;
  [key: string]: any;
}