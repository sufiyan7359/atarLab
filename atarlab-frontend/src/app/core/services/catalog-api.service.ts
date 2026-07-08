import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Brand, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>('/categories');
  }

  getBrands(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>('/brands');
  }

  suggest(q: string): Observable<ApiResponse<{ products: unknown[]; categories: unknown[]; brands: unknown[] }>> {
    return this.http.get<ApiResponse<{ products: unknown[]; categories: unknown[]; brands: unknown[] }>>(
      '/search/suggest',
      { params: { q } },
    );
  }
}
