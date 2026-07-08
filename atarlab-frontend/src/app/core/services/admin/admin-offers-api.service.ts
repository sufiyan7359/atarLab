import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Offer } from '../../models/admin.model';

export type OfferPayload = Omit<Offer, 'id'>;

@Injectable({ providedIn: 'root' })
export class AdminOffersApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<Offer[]>> {
    return this.http.get<ApiResponse<Offer[]>>('/admin/offers');
  }

  create(payload: Partial<OfferPayload>): Observable<ApiResponse<Offer>> {
    return this.http.post<ApiResponse<Offer>>('/admin/offers', payload);
  }

  update(id: string, payload: Partial<OfferPayload>): Observable<ApiResponse<Offer>> {
    return this.http.patch<ApiResponse<Offer>>(`/admin/offers/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/offers/${id}`);
  }
}
