import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { CheckoutResult, Order } from '../models/order.model';

export interface CheckoutPayload {
  shippingAddressId: string;
  billingAddressId?: string;
  paymentMethod: 'RAZORPAY' | 'COD' | 'UPI' | 'WALLET';
  giftWrap?: boolean;
  orderNote?: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  checkout(payload: CheckoutPayload): Observable<ApiResponse<CheckoutResult>> {
    return this.http.post<ApiResponse<CheckoutResult>>('/orders/checkout', payload);
  }

  list(page = 1): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>('/orders', { params: { page } });
  }

  getById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`/orders/${id}`);
  }

  getTracking(id: string): Observable<ApiResponse<{ status: string; statusHistory: unknown[] }>> {
    return this.http.get<ApiResponse<{ status: string; statusHistory: unknown[] }>>(`/orders/${id}/tracking`);
  }

  cancel(id: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`/orders/${id}/cancel`, {});
  }

  downloadInvoice(id: string): Observable<Blob> {
    return this.http.get(`/orders/${id}/invoice`, { responseType: 'blob' });
  }

  verifyRazorpayPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Observable<ApiResponse<{ order: Order }>> {
    return this.http.post<ApiResponse<{ order: Order }>>('/payments/razorpay/verify', payload);
  }
}
