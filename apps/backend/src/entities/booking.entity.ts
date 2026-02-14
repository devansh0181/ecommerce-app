import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { User } from './user.entity';
import { Salon } from './salon.entity';
import { BookingService } from './booking-service.entity';

@Entity('bookings')
export class Booking extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'timestamp' })
  preferredTime: Date;

  @Column({ type: 'int' })
  totalDurationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  // Foreign Keys
  @Column()
  customerId: string;

  @Column()
  salonId: string;

  // Relations
  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => Salon, (salon) => salon.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salonId' })
  salon: Salon;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking, {
    cascade: true,
  })
  bookingServices: BookingService[];
}