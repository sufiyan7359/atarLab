export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockCount: number;
}

export interface RevenuePoint {
  bucket: string;
  revenue: number;
  orders: number;
}

export interface TopProductRow {
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface TopCustomerRow {
  fullName: string;
  email: string | null;
  orders: number;
  totalSpent: number;
}

export interface Banner {
  id: string;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: 'HERO' | 'STRIP' | 'POPUP' | 'CATEGORY';
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string | null;
  bannerImage: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  categoryId: string | null;
  brandId: string | null;
  productId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

export interface InventoryRow {
  id: string;
  sku: string;
  sizeMl: number;
  stockQuantity: number;
  isLowStock: boolean;
  product: { id: string; name: string; slug: string } | null;
}

export interface AdminCustomer {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  roles: { name: string }[];
}

export interface SiteSettings {
  storeName: string;
  supportEmail: string;
  taxRatePercent: number;
  freeShippingThreshold: number;
  flatShippingFee: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
  actor: { fullName: string; email: string | null } | null;
}
