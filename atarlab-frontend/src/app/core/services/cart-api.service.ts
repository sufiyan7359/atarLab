import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Cart, CartSummary } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>('/cart');
  }

  getSummary(): Observable<ApiResponse<CartSummary>> {
    return this.http.get<ApiResponse<CartSummary>>('/cart/summary');
  }

  addItem(variantId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>('/cart/items', { variantId, quantity });
  }

  updateItem(itemId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
  }

  removeItem(itemId: string): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
  }

  applyCoupon(code: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>('/cart/coupon', { code });
  }

  removeCoupon(): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>('/cart/coupon');
  }

  mergeGuestCart(sessionId: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>('/cart/merge', { sessionId });
  }
}
