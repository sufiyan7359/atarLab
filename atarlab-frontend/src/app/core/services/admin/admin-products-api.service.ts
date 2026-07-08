import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Product } from '../../models/product.model';
import { ProductQuery } from '../products-api.service';

export interface AdminVariantPayload {
  sku: string;
  sizeMl: number;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
}

export interface AdminNotePayload {
  noteType: 'TOP' | 'MIDDLE' | 'BASE';
  name: string;
}

export interface AdminImagePayload {
  url: string;
  altText?: string;
}

export interface AdminProductPayload {
  name: string;
  slug: string;
  brandId?: string;
  categoryId?: string;
  shortDescription?: string;
  description?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  concentration?: string;
  longevity?: string;
  projection?: string;
  season?: string[];
  occasion?: string[];
  basePrice: number;
  isActive?: boolean;
  isFeatured?: boolean;
  variants: AdminVariantPayload[];
  fragranceNotes?: AdminNotePayload[];
  ingredients?: string[];
  images?: AdminImagePayload[];
}

@Injectable({ providedIn: 'root' })
export class AdminProductsApiService {
  private readonly http = inject(HttpClient);

  list(query: ProductQuery = {}): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>('/admin/products', {
      params: { ...query, limit: query.limit ?? 20 } as Record<string, string | number>,
    });
  }

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`/admin/products/${id}`);
  }

  create(payload: AdminProductPayload): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>('/admin/products', payload);
  }

  update(id: string, payload: Partial<AdminProductPayload>): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(`/admin/products/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/products/${id}`);
  }
}
