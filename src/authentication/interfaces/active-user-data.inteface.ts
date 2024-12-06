import { Role } from '@prisma/client';
//  import { PermissionType } from '../authorization/permission.type';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: Role[]
  //  permissions: PermissionType;
}

// export interface ActiveUserData {
//   sub: number; // typically the user's ID
//   id: number;
//   email: string;
//   roleId: number; // ID of the role
//   roleName: string; // Name of the role
// }
