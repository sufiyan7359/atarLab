import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Populates req.user when a valid Bearer token is present; never blocks the request otherwise. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as Promise<boolean>;
  }
}
