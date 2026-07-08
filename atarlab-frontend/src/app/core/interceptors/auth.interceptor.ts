import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { AuthRefreshCoordinator } from '../services/auth-refresh-coordinator.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const refreshCoordinator = inject(AuthRefreshCoordinator);

  const token = authStore.accessToken();
  const authedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return refreshCoordinator.refresh().pipe(
        switchMap((res) => {
          authStore.setSession(res.data.accessToken, res.data.user);
          const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.data.accessToken}` } });
          return next(retryReq);
        }),
        catchError((refreshError: unknown) => {
          authStore.clear();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
