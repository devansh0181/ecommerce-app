import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsSubject = new BehaviorSubject<any[]>([]);
  public bookings$ = this.bookingsSubject.asObservable();

  constructor() {}

  createBooking(data: any): Observable<any> {
    return new Observable();
  }

  getMyBookings(): Observable<any[]> {
    return new Observable();
  }

  getBookingById(id: string): Observable<any> {
    return new Observable();
  }

  getBookingsByStatus(status: string): Observable<any[]> {
    return new Observable();
  }

  acceptBooking(id: string): Observable<any> {
    return new Observable();
  }

  rejectBooking(id: string, reason: string): Observable<any> {
    return new Observable();
  }

  startBooking(id: string): Observable<any> {
    return new Observable();
  }

  completeBooking(id: string): Observable<any> {
    return new Observable();
  }
}
