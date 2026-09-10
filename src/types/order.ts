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
  status: number;
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
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export const isPendingOrder = (status: number): boolean =>
  Number(status) === ORDER_STATUS.PENDING;