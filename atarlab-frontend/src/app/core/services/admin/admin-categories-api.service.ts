import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Category } from '../../models/product.model';

export interface CategoryPayload {
  name: string;
  slug: string;
  parentId?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminCategoriesApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>('/admin/categories');
  }

  create(payload: CategoryPayload): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>('/admin/categories', payload);
  }

  update(id: string, payload: Partial<CategoryPayload>): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/categories/${id}`);
  }
}
