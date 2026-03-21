import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { Service } from './service.entity';
import { WorkingHours } from './working-hours.entity';
import { Booking } from './booking.entity';

@Entity('salons')
export class Salon extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ default: false })
  isOpen: boolean;

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  // Foreign Key
  @Column()
  ownerId: string;

  // Relations
  @ManyToOne(() => User, (user) => user.salons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  user: User;

  @OneToMany(() => Service, (service) => service.salon)
  services: Service[];

  @OneToMany(() => WorkingHours, (hours) => hours.salon)
  workingHours: WorkingHours[];

  @OneToMany(() => Booking, (booking) => booking.salon)
  bookings: Booking[];
}