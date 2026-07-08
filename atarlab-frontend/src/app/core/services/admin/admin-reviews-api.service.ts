import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Review } from '../../models/product.model';

@Injectable({ providedIn: 'root' })
export class AdminReviewsApiService {
  private readonly http = inject(HttpClient);

  listPending(page = 1): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>('/admin/reviews', { params: { page, limit: 20 } });
  }

  approve(id: string): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(`/admin/reviews/${id}/approve`, {});
  }

  reject(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`/admin/reviews/${id}/reject`, {});
  }
}
