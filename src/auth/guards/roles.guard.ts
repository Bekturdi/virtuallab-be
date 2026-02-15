import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict route access by role.
 *
 * Usage:
 *   @Roles('TEACHER')
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   someEndpoint() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Guard that checks whether the authenticated user has one of the
 * required roles. Must be used AFTER JwtAuthGuard so that
 * request.user is populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() decorator → allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role as string);
  }
}
