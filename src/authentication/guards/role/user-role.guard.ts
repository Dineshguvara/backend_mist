import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleType } from '../../enums/role-type';
import { ActiveUserData } from '../../interfaces/active-user-data.inteface';
import { ROLES_KEY } from '../../decorators/roles/user-role.decorator';
import { SUPER_ADMIN_ONLY } from 'src/authentication/decorators/roles/super-admin-only.decoratot';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSuperAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ONLY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: { role: string } } = context
      .switchToHttp()
      .getRequest();

    // Ensure user role exists
    if (!user || !user.role) {
      return false;
    }

    // Global access logic: Allow all routes for SuperAdmin
    if (user.role === RoleType.SuperAdmin) {
      return true;
    }

    // If route is marked as SuperAdminOnly, only allow SuperAdmin
    if (isSuperAdminOnly) {
      return false; // Deny access for non-SuperAdmin users
    }

    // Compare required roles with user's role

    // Allow free access for unprotected routes

    return requiredRoles.some((role) => role === user.role);
  }
}
