import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormatDurationPipe } from '../../../../../shared/pipes/format-duration.pipe';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';
import { BookingStatusIndicatorComponent } from '../../../../../shared/components/booking-status-indicator/booking-status-indicator.component';
import { Booking } from '../../../../../core/models';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, RouterModule, FormatPricePipe, FormatDurationPipe, BookingStatusIndicatorComponent],
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.scss'],
})
export class BookingCardComponent {
  @Input() booking!: Booking;
  @Output() viewBooking = new EventEmitter<string>();

  onOpen(): void {
    if (this.booking?.id) {
      this.viewBooking.emit(this.booking.id);
    }
  }

  get serviceNames(): string {
    return (
      this.booking?.bookingServices
        ?.map((item) => item.service?.name || item.serviceId)
        .filter((name) => !!name)
        .join(', ') ||
      'Service details unavailable'
    );
  }

}
