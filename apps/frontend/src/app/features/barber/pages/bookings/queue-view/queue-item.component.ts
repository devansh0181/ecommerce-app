import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../../core/models';

@Component({
  selector: 'app-queue-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queue-item.component.html',
  styleUrls: ['./queue-item.component.scss'],
})
export class QueueItemComponent {
  @Input() booking: Booking | null = null;
  @Input() position = 0;
  @Input() disabled = false;
  @Output() startService = new EventEmitter<Booking>();
  @Output() completeService = new EventEmitter<Booking>();
  @Output() reschedule = new EventEmitter<Booking>();
  @Output() cancel = new EventEmitter<Booking>();

  get customerName(): string {
    const first = this.booking?.customer?.firstName || '';
    const last = this.booking?.customer?.lastName || '';
    return [first, last].filter(Boolean).join(' ') || 'Customer';
  }

  get serviceNames(): string {
    return (this.booking?.bookingServices || [])
      .map((item: { service?: { name?: string } }) => item.service?.name)
      .filter(Boolean)
      .join(', ') || 'No services';
  }

  get statusClass(): string {
    switch (this.booking?.status) {
      case 'PENDING':
        return 'status-tag--pending';
      case 'ACCEPTED':
        return 'status-tag--accepted';
      case 'IN_PROGRESS':
        return 'status-tag--active';
      case 'COMPLETED':
        return 'status-tag--completed';
      case 'REJECTED':
        return 'status-tag--rejected';
      default:
        return 'status-tag--default';
    }
  }

  get durationLabel(): string {
    const minutes = this.booking?.totalDurationMinutes ?? 0;
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours}h ${remainder}m`;
  }

  onStart(): void {
    if (this.booking) {
      this.startService.emit(this.booking);
    }
  }

  onComplete(): void {
    if (this.booking) {
      this.completeService.emit(this.booking);
    }
  }

  onReschedule(): void {
    if (this.booking) {
      this.reschedule.emit(this.booking);
    }
  }

  onCancel(): void {
    if (this.booking) {
      this.cancel.emit(this.booking);
    }
  }
}
