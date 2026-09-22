export interface OrderItemDto {
  id: string;
  price: number;
  courseId?: string;
  courseTitle?: string;
  packageId?: string | null;
  packageName?: string | null;
}

export interface OrderDto {
  id: string;
  userId: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  status: string | number;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  appliedCouponCode?: string | null;
  receiptUrl?: string | null;
  receiptVerified: boolean;
  items: OrderItemDto[];
  creationTime: string;
}

export interface OrdersListResponse {
  totalCount: number;
  items: OrderDto[];
}

export interface GetOrdersParams {
  Status?: string;
  InstructorId?: string;
  CourseId?: string;
  UserId?: string;
  StudentId?: string;
  Filter?: string;
  Sorting?: string;
  SkipCount?: number;
  MaxResultCount?: number;
}

export const ORDER_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export function isPendingOrder(status: unknown): boolean {
  if (status === null || status === undefined) return false;
  const s = String(status).trim().toLowerCase();
  return s === 'pending' || s === '0' || s === 'under_review';
}

export function isPaidOrder(status: unknown): boolean {
  if (status === null || status === undefined) return false;
  const s = String(status).trim().toLowerCase();
  return (
    s === 'paid' ||
    s === '1' ||
    s === 'approved' ||
    s === 'paid_active' ||
    s === 'completed'
  );
}

export function isCancelledOrder(status: unknown): boolean {
  if (status === null || status === undefined) return false;
  const s = String(status).trim().toLowerCase();
  return s === 'cancelled' || s === 'canceled' || s === '2' || s === 'rejected';
}