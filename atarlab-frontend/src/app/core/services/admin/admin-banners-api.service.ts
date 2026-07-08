import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Banner } from '../../models/admin.model';

export type BannerPayload = Omit<Banner, 'id'>;

@Injectable({ providedIn: 'root' })
export class AdminBannersApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<Banner[]>> {
    return this.http.get<ApiResponse<Banner[]>>('/admin/banners');
  }

  create(payload: Partial<BannerPayload>): Observable<ApiResponse<Banner>> {
    return this.http.post<ApiResponse<Banner>>('/admin/banners', payload);
  }

  update(id: string, payload: Partial<BannerPayload>): Observable<ApiResponse<Banner>> {
    return this.http.patch<ApiResponse<Banner>>(`/admin/banners/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/banners/${id}`);
  }
}
