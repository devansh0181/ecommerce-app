import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { QueuePosition } from '../models';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  constructor(private api: ApiService) {}

  getQueuePosition(bookingId: string): Observable<QueuePosition> {
    return this.api.get<QueuePosition>(`/bookings/${bookingId}/queue-position`);
  }

  calculateWaitTime(position: number, avgDurationMinutes: number = 30): number {
    if (position <= 1) return 0;
    return (position - 1) * avgDurationMinutes;
  }

  formatWaitTime(minutes: number): string {
    if (minutes === 0) return 'Next in queue';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getQueuePositionClass(position: number): string {
    if (position === 1) return 'queue-next';
    if (position <= 3) return 'queue-soon';
    return 'queue-waiting';
  }
}
