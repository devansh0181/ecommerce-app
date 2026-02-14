import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { DayOfWeek } from '../common/enums/day-of-week.enum';
import { Salon } from './salon.entity';

@Entity('working_hours')
export class WorkingHours extends BaseEntity {
  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  openTime: string; // Format: "HH:MM:SS"

  @Column({ type: 'time' })
  closeTime: string; // Format: "HH:MM:SS"

  @Column({ default: false })
  isClosed: boolean; // True if salon is closed on this day

  // Foreign Key
  @Column()
  salonId: string;

  // Relations
  @ManyToOne(() => Salon, (salon) => salon.workingHours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salonId' })
  salon: Salon;
}