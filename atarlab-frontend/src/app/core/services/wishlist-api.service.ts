import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Cart } from '../models/cart.model';
import { Product, ProductVariant } from '../models/product.model';

export interface WishlistItem {
  id: string;
  productId: string;
  variantId: string | null;
  product: Product;
  variant: ProductVariant | null;
}

@Injectable({ providedIn: 'root' })
export class WishlistApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<WishlistItem[]>> {
    return this.http.get<ApiResponse<WishlistItem[]>>('/wishlist');
  }

  add(productId: string, variantId?: string): Observable<ApiResponse<WishlistItem>> {
    return this.http.post<ApiResponse<WishlistItem>>('/wishlist', { productId, variantId });
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/wishlist/${id}`);
  }

  moveToCart(id: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`/wishlist/${id}/move-to-cart`, {});
  }
}
