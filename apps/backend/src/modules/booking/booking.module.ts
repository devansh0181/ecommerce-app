import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingService as BookingServiceEntity } from '../../entities/booking-service.entity';
import { Salon } from '../../entities/salon.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { QueueService } from './queue.service';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingServiceEntity, Salon]),
    ServiceModule, // Import to use ServiceService
  ],
  controllers: [BookingController],
  providers: [BookingService, QueueService],
  exports: [BookingService, QueueService, TypeOrmModule],
})
export class BookingModule {}