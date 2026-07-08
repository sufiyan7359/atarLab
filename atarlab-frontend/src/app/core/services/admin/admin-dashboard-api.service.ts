import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { DashboardSummary, RevenuePoint, TopCustomerRow, TopProductRow } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardApiService {
  private readonly http = inject(HttpClient);

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>('/admin/dashboard/summary');
  }

  getRevenue(range: 'week' | 'month' | 'year'): Observable<ApiResponse<RevenuePoint[]>> {
    return this.http.get<ApiResponse<RevenuePoint[]>>('/admin/dashboard/revenue', { params: { range } });
  }

  getTopProducts(): Observable<ApiResponse<TopProductRow[]>> {
    return this.http.get<ApiResponse<TopProductRow[]>>('/admin/reports/top-products');
  }

  getTopCustomers(): Observable<ApiResponse<TopCustomerRow[]>> {
    return this.http.get<ApiResponse<TopCustomerRow[]>>('/admin/reports/customers');
  }
}
