import { ApiProperty } from '@nestjs/swagger';

export class SchoolEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;
}
