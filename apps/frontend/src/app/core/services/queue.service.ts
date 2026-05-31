import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  constructor() {}

  getQueuePosition(bookingId: string): Observable<any> {
    return new Observable();
  }

  getQueueByPosition(salonId: string): Observable<any[]> {
    return new Observable();
  }

  calculateWaitTime(bookings: any[]): number {
    // To be implemented
    return 0;
  }
}
