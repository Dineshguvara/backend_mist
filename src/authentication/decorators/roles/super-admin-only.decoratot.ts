import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_ONLY = 'super_admin_only';
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_ONLY, true);
