import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/api-response.model';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsApiService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File): Observable<ApiResponse<UploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<UploadResult>>('/admin/uploads/image', formData);
  }
}
