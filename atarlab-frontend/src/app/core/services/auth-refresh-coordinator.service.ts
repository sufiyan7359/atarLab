import { Injectable, inject } from '@angular/core';
import { Observable, finalize, share } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { ApiResponse } from '../models/api-response.model';
import { AuthResponse } from '../models/user.model';

/**
 * Ensures at most one /auth/refresh request is ever in flight at a time, no matter which
 * caller triggers it (app bootstrap, the auth interceptor, a manual retry, ...). Refresh
 * tokens are single-use and rotate on every call — two concurrent calls sharing the same
 * cookie would cause the loser to be treated as token reuse and revoke the whole session.
 */
@Injectable({ providedIn: 'root' })
export class AuthRefreshCoordinator {
  private readonly authApi = inject(AuthApiService);
  private inFlight: Observable<ApiResponse<AuthResponse>> | null = null;

  refresh(): Observable<ApiResponse<AuthResponse>> {
    this.inFlight ??= this.authApi.refresh().pipe(
      finalize(() => (this.inFlight = null)),
      share(),
    );
    return this.inFlight;
  }
}
