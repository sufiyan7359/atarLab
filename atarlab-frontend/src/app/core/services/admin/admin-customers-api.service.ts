import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { AdminCustomer } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminCustomersApiService {
  private readonly http = inject(HttpClient);

  list(page = 1): Observable<ApiResponse<AdminCustomer[]>> {
    return this.http.get<ApiResponse<AdminCustomer[]>>('/admin/customers', { params: { page, limit: 20 } });
  }

  getById(id: string): Observable<ApiResponse<AdminCustomer>> {
    return this.http.get<ApiResponse<AdminCustomer>>(`/admin/customers/${id}`);
  }

  setStatus(id: string, isActive: boolean): Observable<ApiResponse<AdminCustomer>> {
    return this.http.patch<ApiResponse<AdminCustomer>>(`/admin/customers/${id}/status`, { isActive });
  }
}
