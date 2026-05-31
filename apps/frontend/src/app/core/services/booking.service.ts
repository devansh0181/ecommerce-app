import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Booking } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private myBookingsSubject = new BehaviorSubject<Booking[]>([]);
  myBookings$ = this.myBookingsSubject.asObservable();

  private selectedBookingSubject = new BehaviorSubject<Booking | null>(null);
  selectedBooking$ = this.selectedBookingSubject.asObservable();

  private salonBookingsSubject = new BehaviorSubject<Booking[]>([]);
  salonBookings$ = this.salonBookingsSubject.asObservable();

  constructor(private api: ApiService) {}

  createBooking(data: any) {
    return this.api.post<Booking>('/bookings', data).pipe(
      tap((booking) => {
        const current = this.myBookingsSubject.value;
        this.myBookingsSubject.next([...current, booking]);
      })
    );
  }

  getMyBookings(status?: string) {
    const params = status ? { status } : undefined;
    return this.api.get<Booking[]>('/bookings/my-bookings', params).pipe(
      tap((bookings) => {
        this.myBookingsSubject.next(bookings);
      })
    );
  }

  getBookingById(id: string) {
    return this.api.get<Booking>(`/bookings/${id}`).pipe(
      tap((booking) => {
        this.selectedBookingSubject.next(booking);
      })
    );
  }

  getSalonBookings(salonId: string, params?: any) {
    return this.api.get<Booking[]>(`/salons/${salonId}/bookings`, params).pipe(
      tap((bookings) => {
        this.salonBookingsSubject.next(bookings);
      })
    );
  }

  acceptBooking(id: string) {
    return this.api.patch<Booking>(`/bookings/${id}/accept`, {}).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  rejectBooking(id: string, rejectionReason?: string) {
    return this.api.patch<Booking>(`/bookings/${id}/reject`, { rejectionReason }).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  startBooking(id: string) {
    return this.api.patch<Booking>(`/bookings/${id}/start`, {}).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  completeBooking(id: string) {
    return this.api.patch<Booking>(`/bookings/${id}/complete`, {}).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  getSalonQueue(salonId: string) {
    return this.api.get<Booking[]>(`/salons/${salonId}/queue`);
  }

  private updateBookingInLists(booking: Booking): void {
    if (this.selectedBookingSubject.value?.id === booking.id) {
      this.selectedBookingSubject.next(booking);
    }

    const myBookings = this.myBookingsSubject.value.map((b) => (b.id === booking.id ? booking : b));
    this.myBookingsSubject.next(myBookings);

    const salonBookings = this.salonBookingsSubject.value.map((b) => (b.id === booking.id ? booking : b));
    this.salonBookingsSubject.next(salonBookings);
  }

  getSelectedBooking(): Booking | null {
    return this.selectedBookingSubject.value;
  }

  setSelectedBooking(booking: Booking | null): void {
    this.selectedBookingSubject.next(booking);
  }
}
