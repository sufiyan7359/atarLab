import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  me(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>('/users/me');
  }

  updateProfile(payload: { fullName?: string; avatarUrl?: string }): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>('/users/me', payload);
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>('/users/me/password', payload);
  }
}
