export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNISEX = 'UNISEX',
}

export enum Concentration {
  ATTAR = 'ATTAR',
  EDP = 'EDP',
  EDT = 'EDT',
  OIL = 'OIL',
}

export enum NoteType {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BASE = 'BASE',
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  PICKED = 'PICKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  COD = 'COD',
  UPI = 'UPI',
  WALLET = 'WALLET',
}

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  COD = 'COD',
}

export enum PaymentTxnStatus {
  CREATED = 'CREATED',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum OtpPurpose {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_PHONE = 'VERIFY_PHONE',
}

export enum InventoryReason {
  PURCHASE = 'PURCHASE',
  RESTOCK = 'RESTOCK',
  ADJUSTMENT = 'ADJUSTMENT',
  ORDER = 'ORDER',
  RETURN = 'RETURN',
}
