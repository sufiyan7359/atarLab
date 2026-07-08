import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { CartIdentity } from '../interfaces/cart-identity.interface';

export const CartId = createParamDecorator((_data: unknown, ctx: ExecutionContext): CartIdentity => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: { id: string } }>();
  const sessionId = request.headers['x-session-id'];
  return {
    userId: request.user?.id,
    sessionId: typeof sessionId === 'string' ? sessionId : undefined,
  };
});
