import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../enums/role-type';

export const ROLES_KEY = 'role';
export const Roles = (...role: RoleType[]) => SetMetadata(ROLES_KEY, role);
