import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RoleEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
