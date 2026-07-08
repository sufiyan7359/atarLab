import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Product, Review } from '../models/product.model';

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  gender?: string;
  concentration?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  list(query: ProductQuery = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value);
      }
    }
    return this.http.get<ApiResponse<Product[]>>('/products', { params });
  }

  getBySlug(slug: string): Observable<ApiResponse<Product & { related: Product[] }>> {
    return this.http.get<ApiResponse<Product & { related: Product[] }>>(`/products/${slug}`);
  }

  getReviews(slug: string, page = 1): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`/products/${slug}/reviews`, { params: { page } });
  }

  addReview(
    slug: string,
    payload: { rating: number; title?: string; comment?: string },
  ): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`/products/${slug}/reviews`, payload);
  }
}
