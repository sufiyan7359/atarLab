import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { ActivityLog } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminActivityLogsApiService {
  private readonly http = inject(HttpClient);

  list(page = 1): Observable<ApiResponse<ActivityLog[]>> {
    return this.http.get<ApiResponse<ActivityLog[]>>('/admin/activity-logs', { params: { page, limit: 30 } });
  }
}
