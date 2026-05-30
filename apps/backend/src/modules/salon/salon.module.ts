import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // Add this
import { Salon } from '../../entities/salon.entity';
import { WorkingHours } from '../../entities/working-hours.entity';
import { SalonService } from './salon.service';
import { SalonController } from './salon.controller';
import { SalonScheduler } from './salon.scheduler'; // Add this
import { SalonBookingController } from './salon-booking.controller';
import { BookingModule } from '../booking/booking.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Salon, WorkingHours]),
    ScheduleModule.forRoot(), // Add this
    BookingModule
  ],
  controllers: [SalonController,SalonBookingController], // Add SalonBookingController
  providers: [SalonService, SalonScheduler], // Add SalonScheduler
  exports: [SalonService, TypeOrmModule],
})
export class SalonModule {}