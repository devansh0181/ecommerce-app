import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { Salon } from './salon.entity';
import { Booking } from './booking.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Will be hashed

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  // Relations
  @OneToMany(() => Salon, (salon) => salon.owner)
  salons: Salon[];

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];
}