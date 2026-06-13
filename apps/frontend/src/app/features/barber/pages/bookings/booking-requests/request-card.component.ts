import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Booking } from '../../../../../core/models';

@Component({
  selector: 'app-booking-request-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class BookingRequestCardComponent {
  @Input() booking: Booking | null = null;
  @Input() disabled = false;
  @Output() accept = new EventEmitter<Booking>();
  @Output() reject = new EventEmitter<Booking>();
  @Output() start = new EventEmitter<Booking>();
  @Output() complete = new EventEmitter<Booking>();

  get customerName(): string {
    const first = this.booking?.customer?.firstName || '';
    const last = this.booking?.customer?.lastName || '';
    return [first, last].filter(Boolean).join(' ') || 'Customer';
  }

  get customerPhone(): string {
    return this.booking?.customer?.phone || 'No phone available';
  }

  get serviceNames(): string {
    return (this.booking?.bookingServices || [])
      .map((item: { service?: { name?: string } }) => item.service?.name)
      .filter(Boolean)
      .join(', ') || 'No services selected';
  }

  get preferredTime(): string {
    const date = new Date(this.booking?.preferredTime || this.booking?.createdAt || '');
    return isNaN(date.getTime())
      ? 'Time not available'
      : date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  get initials(): string {
    const parts = this.customerName.split(' ').filter(Boolean);
    return parts.length ? parts.map((p) => p[0].toUpperCase()).join('').slice(0, 2) : 'CU';
  }

  onAccept(): void {
    if (this.booking) {
      this.accept.emit(this.booking);
    }
  }

  onReject(): void {
    if (this.booking) {
      this.reject.emit(this.booking);
    }
  }

  onStart(): void {
    if (this.booking) {
      this.start.emit(this.booking);
    }
  }

  onComplete(): void {
    if (this.booking) {
      this.complete.emit(this.booking);
    }
  }
}
