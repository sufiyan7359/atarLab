import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { RequestUser } from '../interfaces/auth.interface';
import { RolesPermissionsService } from '../../modules/roles-permissions/roles-permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<{ user: RequestUser }>();
    if (!user) {
      return false;
    }
    const grantedPermissions =
      await this.rolesPermissionsService.getPermissionsForRoles(user.roles);
    return requiredPermissions.every((permission) =>
      grantedPermissions.has(permission),
    );
  }
}
