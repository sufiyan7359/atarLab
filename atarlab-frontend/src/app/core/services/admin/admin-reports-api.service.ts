import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminReportsApiService {
  private readonly http = inject(HttpClient);

  exportTopProductsCsv(): Observable<Blob> {
    return this.http.get('/admin/reports/top-products', { params: { format: 'csv' }, responseType: 'blob' });
  }

  exportTopCustomersCsv(): Observable<Blob> {
    return this.http.get('/admin/reports/customers', { params: { format: 'csv' }, responseType: 'blob' });
  }
}
