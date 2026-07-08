import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse, User } from '../models/user.model';

export interface RegisterPayload {
  email?: string;
  phone?: string;
  fullName: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  register(payload: RegisterPayload): Observable<ApiResponse<{ id: string; email: string | null; fullName: string }>> {
    return this.http.post<ApiResponse<{ id: string; email: string | null; fullName: string }>>(
      '/auth/register',
      payload,
    );
  }

  login(payload: LoginPayload): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/auth/login', payload);
  }

  refresh(): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/auth/refresh', {});
  }

  logout(): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>('/auth/logout', {});
  }

  me(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>('/auth/me');
  }

  forgotPassword(email: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword });
  }
}
