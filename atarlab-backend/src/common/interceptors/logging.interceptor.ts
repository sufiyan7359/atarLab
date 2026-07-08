import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { user?: { id: string } }>();
    const response = httpContext.getResponse<Response>();
    const { method, originalUrl } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.log(method, originalUrl, response.statusCode, start, request.user?.id),
        error: (err: { status?: number }) =>
          this.log(method, originalUrl, err.status ?? 500, start, request.user?.id),
      }),
    );
  }

  private log(method: string, url: string, status: number, start: number, userId?: string) {
    const duration = Date.now() - start;
    this.logger.log(
      `${method} ${url} ${status} ${duration}ms${userId ? ` user=${userId}` : ''}`,
    );
  }
}
