import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { SiteSettings } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminSettingsApiService {
  private readonly http = inject(HttpClient);

  get(): Observable<ApiResponse<SiteSettings>> {
    return this.http.get<ApiResponse<SiteSettings>>('/admin/settings');
  }

  update(payload: Partial<SiteSettings>): Observable<ApiResponse<SiteSettings>> {
    return this.http.patch<ApiResponse<SiteSettings>>('/admin/settings', payload);
  }
}
