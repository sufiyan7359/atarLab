import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { InventoryRow } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminInventoryApiService {
  private readonly http = inject(HttpClient);

  list(page = 1, lowStockOnly = false): Observable<ApiResponse<InventoryRow[]>> {
    let params = new HttpParams().set('page', page).set('limit', 20);
    if (lowStockOnly) params = params.set('lowStockOnly', 'true');
    return this.http.get<ApiResponse<InventoryRow[]>>('/admin/inventory', { params });
  }

  adjust(variantId: string, changeQty: number): Observable<ApiResponse<InventoryRow>> {
    return this.http.post<ApiResponse<InventoryRow>>('/admin/inventory/adjust', { variantId, changeQty });
  }
}
