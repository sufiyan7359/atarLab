import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Address, CreateAddressPayload } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressesApiService {
  private readonly http = inject(HttpClient);

  list(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>('/addresses');
  }

  create(payload: CreateAddressPayload): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>('/addresses', payload);
  }

  update(id: string, payload: Partial<CreateAddressPayload>): Observable<ApiResponse<Address>> {
    return this.http.patch<ApiResponse<Address>>(`/addresses/${id}`, payload);
  }

  remove(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/addresses/${id}`);
  }

  setDefault(id: string): Observable<ApiResponse<Address>> {
    return this.http.patch<ApiResponse<Address>>(`/addresses/${id}/default`, {});
  }
}
