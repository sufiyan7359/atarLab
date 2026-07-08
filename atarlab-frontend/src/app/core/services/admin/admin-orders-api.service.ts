import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Order, OrderStatus } from '../../models/order.model';

@Injectable({ providedIn: 'root' })
export class AdminOrdersApiService {
  private readonly http = inject(HttpClient);

  list(page = 1): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>('/admin/orders', { params: { page, limit: 20 } });
  }

  getById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  }

  updateStatus(id: string, status: OrderStatus, note?: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status, note });
  }

  refund(id: string, note?: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`/admin/orders/${id}/refund`, { note });
  }
}
