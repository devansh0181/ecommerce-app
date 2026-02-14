import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingService } from '../../entities/booking-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingService])],
  exports: [TypeOrmModule],
})
export class BookingModule {}