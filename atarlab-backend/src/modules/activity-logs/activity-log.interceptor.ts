import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { ActivityLogsService } from './activity-logs.service';

const MUTATING_METHODS: Record<string, string> = {
  POST: 'create',
  PATCH: 'update',
  PUT: 'update',
  DELETE: 'delete',
};

interface RequestWithUser extends Request {
  user?: { id: string };
}

/**
 * Records a lightweight audit trail for every admin mutation (POST/PATCH/PUT/DELETE under
 * /admin/*). Captures the actor, action, target entity, and the response payload as `after` —
 * a full before/after diff would need per-resource instrumentation, which is out of scope here.
 */
@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const verb = MUTATING_METHODS[request.method];
    const isAdminRoute =
      request.originalUrl.includes('/admin/') ||
      request.originalUrl.endsWith('/admin');

    if (!verb || !isAdminRoute) {
      return next.handle();
    }

    const entityType = this.extractEntityType(request.originalUrl);
    const entityId =
      (request.params as Record<string, string> | undefined)?.['id'] ?? null;

    return next.handle().pipe(
      tap((result) => {
        void this.activityLogsService.record({
          actorUserId: request.user?.id ?? null,
          action: `${entityType}.${verb}`,
          entityType,
          entityId,
          after: this.toJsonSafe(result),
          ip: request.ip,
        });
      }),
    );
  }

  private extractEntityType(url: string): string {
    const withoutQuery = url.split('?')[0];
    const segments = withoutQuery.split('/').filter(Boolean);
    const adminIndex = segments.indexOf('admin');
    return segments[adminIndex + 1] ?? 'unknown';
  }

  private toJsonSafe(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    try {
      return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
