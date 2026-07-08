import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AppNotification } from '../models/tracking.model';

@Injectable({ providedIn: 'root' })
export class NotificationsApiService {
  private readonly http = inject(HttpClient);

  list(page = 1): Observable<ApiResponse<AppNotification[]>> {
    return this.http.get<ApiResponse<AppNotification[]>>('/notifications', { params: { page, limit: 20 } });
  }

  unreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  }

  markRead(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>('/notifications/read-all', {});
  }
}
