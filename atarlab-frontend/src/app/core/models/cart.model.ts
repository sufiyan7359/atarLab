import { ProductVariant, Product } from './product.model';

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  giftWrap: boolean;
  note: string | null;
  variant: ProductVariant & { product?: Product };
}

export interface Cart {
  id: string;
  couponCode: string | null;
  items: CartItem[];
}

export interface CartSummary {
  cart: Cart;
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxTotal: number;
  grandTotal: number;
}
