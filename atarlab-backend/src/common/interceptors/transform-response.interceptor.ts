import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { PaginatedResult } from '../dto/pagination.dto';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number };
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    'items' in value &&
    'total' in value &&
    'page' in value &&
    'limit' in value
  );
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        if (isPaginatedResult(result)) {
          return {
            success: true as const,
            data: result.items as T,
            meta: { page: result.page, limit: result.limit, total: result.total },
          };
        }
        return { success: true as const, data: result };
      }),
    );
  }
}
