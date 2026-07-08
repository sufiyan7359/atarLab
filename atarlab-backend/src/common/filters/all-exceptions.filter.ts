import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, error } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      // No-op when SENTRY_DSN isn't set (see instrument.ts) — same sandbox-fallback
      // pattern as every other optional integration in this app.
      Sentry.captureException(exception);
    }

    response.status(status).json({ success: false, error });
  }

  private resolve(exception: unknown): { status: number; error: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string }).message ?? exception.message);
      const details =
        typeof body === 'object'
          ? (body as { message?: unknown }).message
          : undefined;
      return {
        status,
        error: {
          code: HttpStatus[status] ?? 'HTTP_ERROR',
          message: Array.isArray(message) ? 'Validation failed' : message,
          details: Array.isArray(details) ? details : undefined,
        },
      };
    }

    if (exception instanceof QueryFailedError) {
      const driverError = exception as QueryFailedError & { code?: string };
      if (driverError.code === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          error: {
            code: 'CONFLICT',
            message: 'A record with the same unique value already exists',
          },
        };
      }
      if (driverError.code === '23503') {
        return {
          status: HttpStatus.BAD_REQUEST,
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Referenced record does not exist',
          },
        };
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: { code: 'DATABASE_ERROR', message: 'A database error occurred' },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }
}
