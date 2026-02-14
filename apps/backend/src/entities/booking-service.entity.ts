import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Booking } from './booking.entity';
import { Service } from './service.entity';

@Entity('booking_services')
export class BookingService extends BaseEntity {
  // Snapshot fields (preserve values at booking time)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtBooking: number;

  @Column({ type: 'int' })
  durationAtBooking: number;

  // Foreign Keys
  @Column()
  bookingId: string;

  @Column()
  serviceId: string;

  // Relations
  @ManyToOne(() => Booking, (booking) => booking.bookingServices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => Service, (service) => service.bookingServices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}