import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Role hierarchy: Owner > Admin > Viewer
    const roleHierarchy = {
      [Role.OWNER]: 3,
      [Role.ADMIN]: 2,
      [Role.VIEWER]: 1,
    };

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = Math.min(...requiredRoles.map(role => roleHierarchy[role]));

    return userRoleLevel >= requiredRoleLevel;
  }
}
