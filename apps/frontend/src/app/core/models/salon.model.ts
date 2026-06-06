export interface Salon {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  isOpen: boolean;
  openedAt?: Date;
  closedAt?: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  services?: Service[];
  workingHours?: WorkingHours[];
}

export interface WorkingHours {
  id: string;
  salonId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  salonId: string;
  createdAt: Date;
  updatedAt: Date;
}
