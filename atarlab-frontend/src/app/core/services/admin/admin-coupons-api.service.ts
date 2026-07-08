import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Coupon } from '../../models/admin.model';

export type CouponPayload = Omit<Coupon, 'id' | 'usedCount'>;

@Injectable({ providedIn: 'root' })
export class AdminCouponsApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<Coupon[]>> {
    return this.http.get<ApiResponse<Coupon[]>>('/admin/coupons');
  }

  create(payload: Partial<CouponPayload>): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>('/admin/coupons', payload);
  }

  update(id: string, payload: Partial<CouponPayload>): Observable<ApiResponse<Coupon>> {
    return this.http.patch<ApiResponse<Coupon>>(`/admin/coupons/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/coupons/${id}`);
  }
}
