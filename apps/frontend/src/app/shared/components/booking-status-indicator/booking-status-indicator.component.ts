import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStatusPipe } from '../../pipes/booking-status.pipe';

@Component({
  selector: 'app-booking-status-indicator',
  standalone: true,
  imports: [CommonModule, BookingStatusPipe],
  templateUrl: './booking-status-indicator.component.html',
  styleUrls: ['./booking-status-indicator.component.scss'],
})
export class BookingStatusIndicatorComponent {
  @Input() status: string | null | undefined = null;
  @Input() compact = false;

  get statusClass(): string {
    switch (this.status) {
      case 'PENDING':
        return 'status-pill--pending';
      case 'ACCEPTED':
        return 'status-pill--accepted';
      case 'IN_PROGRESS':
        return 'status-pill--in-progress';
      case 'COMPLETED':
        return 'status-pill--completed';
      case 'REJECTED':
        return 'status-pill--cancelled';
      default:
        return 'status-pill--default';
    }
  }

  get statusDescription(): string {
    switch (this.status) {
      case 'PENDING':
        return 'Your booking is awaiting confirmation from the salon.';
      case 'ACCEPTED':
        return 'Your booking has been accepted and is in the queue.';
      case 'IN_PROGRESS':
        return 'Your service is currently in progress.';
      case 'COMPLETED':
        return 'Your booking has been completed.';
      case 'REJECTED':
        return 'This booking was declined or cancelled.';
      default:
        return 'Status information is unavailable.';
    }
  }
}
