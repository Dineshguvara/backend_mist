import { Module } from '@nestjs/common';
import { SuperAdminsService } from './super-admins.service';
import { SuperAdminsController } from './super-admins.controller';

@Module({
  controllers: [SuperAdminsController],
  providers: [SuperAdminsService],
})
export class SuperAdminsModule {}
