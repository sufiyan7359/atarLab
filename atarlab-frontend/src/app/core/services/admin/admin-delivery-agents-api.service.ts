import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { DeliveryAgent, OrderDelivery } from '../../models/tracking.model';

export type DeliveryAgentPayload = Omit<DeliveryAgent, 'id'>;

@Injectable({ providedIn: 'root' })
export class AdminDeliveryAgentsApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<DeliveryAgent[]>> {
    return this.http.get<ApiResponse<DeliveryAgent[]>>('/admin/delivery-agents');
  }

  create(payload: Partial<DeliveryAgentPayload>): Observable<ApiResponse<DeliveryAgent>> {
    return this.http.post<ApiResponse<DeliveryAgent>>('/admin/delivery-agents', payload);
  }

  update(id: string, payload: Partial<DeliveryAgentPayload>): Observable<ApiResponse<DeliveryAgent>> {
    return this.http.patch<ApiResponse<DeliveryAgent>>(`/admin/delivery-agents/${id}`, payload);
  }

  getForOrder(orderId: string): Observable<ApiResponse<OrderDelivery | null>> {
    return this.http.get<ApiResponse<OrderDelivery | null>>(`/admin/orders/${orderId}/delivery`);
  }

  assign(orderId: string, agentId: string, etaMinutes?: number): Observable<ApiResponse<OrderDelivery>> {
    return this.http.post<ApiResponse<OrderDelivery>>(`/admin/orders/${orderId}/delivery/assign`, { agentId, etaMinutes });
  }
}
