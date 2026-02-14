import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from '../../entities/salon.entity';
import { WorkingHours } from '../../entities/working-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salon, WorkingHours])],
  exports: [TypeOrmModule],
})
export class SalonModule {}