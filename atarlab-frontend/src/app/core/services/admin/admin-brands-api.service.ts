import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Brand } from '../../models/product.model';

export interface BrandPayload {
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminBrandsApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<Brand[]>> {
    return this.http.get<ApiResponse<Brand[]>>('/admin/brands');
  }

  create(payload: BrandPayload): Observable<ApiResponse<Brand>> {
    return this.http.post<ApiResponse<Brand>>('/admin/brands', payload);
  }

  update(id: string, payload: Partial<BrandPayload>): Observable<ApiResponse<Brand>> {
    return this.http.patch<ApiResponse<Brand>>(`/admin/brands/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/brands/${id}`);
  }
}
