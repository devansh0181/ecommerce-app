export interface Booking {
  id: string;
  customerId: string;
  salonId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  preferredTime: Date;
  totalDurationMinutes: number;
  totalPrice: number;
  rejectionReason?: string;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  salon?: {
    id: string;
    name: string;
    address: string;
  };
  bookingServices?: BookingService[];
}

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  priceAtBooking: number;
  durationAtBooking: number;
  service?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
  };
}

export interface QueuePosition {
  bookingId: string;
  position: number;
  estimatedWaitTimeMinutes: number;
  bookingsAhead: number;
  status: string;
  message: string;
}
