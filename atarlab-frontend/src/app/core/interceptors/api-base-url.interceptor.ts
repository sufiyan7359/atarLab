import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);

  if (!req.url.startsWith('/')) {
    return next(req);
  }

  const headers: Record<string, string> = {};
  if (req.url.startsWith('/cart')) {
    headers['X-Session-Id'] = sessionService.getSessionId();
  }

  const apiReq = req.clone({
    url: `${environment.apiUrl}${req.url}`,
    withCredentials: true,
    setHeaders: headers,
  });
  return next(apiReq);
};
