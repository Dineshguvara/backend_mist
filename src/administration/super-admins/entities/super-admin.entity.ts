import { ApiProperty } from '@nestjs/swagger';
import { SuperAdmin } from '@prisma/client';

export class SuperAdminEntity implements SuperAdmin {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  userId: number;
}
