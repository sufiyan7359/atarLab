export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PACKED'
  | 'PICKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface OrderItem {
  id: string;
  productNameSnapshot: string;
  variantSnapshot: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  subtotal: string;
  discountTotal: string;
  shippingFee: string;
  taxTotal: string;
  grandTotal: string;
  placedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
}

export interface CheckoutResult {
  order: Order;
  razorpay?: { orderId: string; amount: number; currency: string; keyId: string };
}
