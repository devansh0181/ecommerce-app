import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Salon, Service as ServiceModel } from '../../../../core/models';
import { BookingService } from '../../../../core/services/booking.service';
import { ServiceSelectorComponent, SelectedService } from './service-selector/service-selector.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [CommonModule, ServiceSelectorComponent, TimePickerComponent, BookingSummaryComponent, BookingConfirmationComponent],
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.scss'],
})
export class BookingDialogComponent {
  @Input() salon: Salon | null = null;
  @Input() services: ServiceModel[] = [];
  @Output() close = new EventEmitter<void>();

  @ViewChild(BookingSummaryComponent) summaryCmp!: BookingSummaryComponent;

  step = 1;
  selectedServices: SelectedService[] = [];
  selectedDateTime = '';
  bookingId = '';
  error: string | null = null;

  constructor(private bookingService: BookingService) {}

  // Step 1: Service Selection
  onServiceSelectionChange(items: SelectedService[]) {
    this.selectedServices = items;
  }

  onServiceSelectionNext(items: SelectedService[]) {
    if (items.length === 0) return;
    this.selectedServices = items;
    this.step = 2;
    this.error = null;
  }

  // Step 2: Time Selection
  onDateTimeChange(dt: string) {
    this.selectedDateTime = dt;
  }

  onTimePickerNext(dt: string) {
    if (!dt) return;
    this.selectedDateTime = dt;
    this.step = 3;
    this.error = null;
  }

  onTimePickerBack() {
    this.step = 1;
  }

  // Step 3: Review & Confirmation
  onEditServices() {
    this.step = 1;
  }

  onEditTime() {
    this.step = 2;
  }

  onConfirmBooking() {
    if (this.selectedServices.length === 0 || !this.selectedDateTime || !this.salon) {
      this.error = 'Missing booking details';
      return;
    }

    this.summaryCmp?.setLoading(true);
    const payload = {
      salonId: this.salon.id,
      services: this.selectedServices.map((s) => ({
        id: s.service.id,
        quantity: s.quantity,
        price: s.service.price,
      })),
      bookingDateTime: this.selectedDateTime,
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (booking: any) => {
        this.bookingId = booking.id || '';
        this.step = 4;
        this.error = null;
      },
      error: (err: any) => {
        this.summaryCmp?.setLoading(false);
        this.error = err?.error?.message || 'Failed to create booking. Please try again.';
      },
    });
  }

  // Step 4: Success
  onViewDetails() {
    this.closeDialog();
  }

  onContinueShopping() {
    this.closeDialog();
  }

  // Common actions
  onServiceSelectionCancel() {
    this.closeDialog();
  }

  onTimePickerCancel() {
    this.closeDialog();
  }

  onSummaryCancel() {
    this.closeDialog();
  }

  closeDialog() {
    this.close.emit();
  }

  get progressPercent(): number {
    return (this.step / 4) * 100;
  }
}
