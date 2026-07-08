import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';
import { Permission, Role } from '../../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminRolesApiService {
  private readonly http = inject(HttpClient);

  listRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>('/admin/roles');
  }

  listPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>('/admin/permissions');
  }

  createRole(payload: { name: string; description?: string; permissionIds?: string[] }): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>('/admin/roles', payload);
  }

  updateRole(
    id: string,
    payload: { name?: string; description?: string; permissionIds?: string[] },
  ): Observable<ApiResponse<Role>> {
    return this.http.patch<ApiResponse<Role>>(`/admin/roles/${id}`, payload);
  }

  removeRole(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/admin/roles/${id}`);
  }
}
