import { BookingStatus } from '../../../common/enums/booking-status.enum'

export class BookingResponseDto {
  id: string;
  status: BookingStatus;
  preferredTime: Date;
  totalDurationMinutes: number;
  totalPrice: number;
  rejectionReason?: string;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  
  salon: {
    id: string;
    name: string;
    address: string;
  };
  
  services: Array<{
    id: string;
    name: string;
    priceAtBooking: number;
    durationAtBooking: number;
  }>;
}