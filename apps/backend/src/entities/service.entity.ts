import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Salon } from './salon.entity';
import { BookingService } from './booking-service.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  // Foreign Key
  @Column()
  salonId: string;

  // Relations
  @ManyToOne(() => Salon, (salon) => salon.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salonId' })
  salon: Salon;

  @OneToMany(() => BookingService, (bookingService) => bookingService.service)
  bookingServices: BookingService[];
}