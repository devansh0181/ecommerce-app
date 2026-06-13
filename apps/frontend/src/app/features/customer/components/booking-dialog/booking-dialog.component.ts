import { Component, EventEmitter, Input, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Salon, Service as ServiceModel } from '../../../../core/models';
import { BookingService } from '../../../../core/services/booking.service';
import { ServiceSelectorComponent, SelectedService } from './service-selector/service-selector.component';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';
import { BookingConfirmationComponent } from './booking-confirmation/booking-confirmation.component';
import { ToastService } from '../../../../shared/services/toast.service';

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

  constructor(
    private bookingService: BookingService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  bookingTimer: any;

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
      serviceIds: this.selectedServices.map((s) => s.service.id),
      preferredTime: this.selectedDateTime,
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (booking: any) => {
        this.bookingId = booking.id || '';
        this.step = 4;
        this.error = null;
        this.cdr.detectChanges();

        // Automatically redirect to my bookings after 4 seconds
        this.bookingTimer = setTimeout(() => {
          this.closeDialog();
          this.router.navigate(['/customer/bookings']);
        }, 4000);
      },
      error: (err: any) => {
        this.summaryCmp?.setLoading(false);
        const errorMessage = err?.error?.message || 'Failed to create booking. Please try again.';
        this.error = errorMessage;
        this.toastService.error(errorMessage);
        this.cdr.detectChanges();
      },
    });
  }

  // Step 4: Success
  onViewDetails() {
    if (this.bookingTimer) clearTimeout(this.bookingTimer);
    this.closeDialog();
    if (this.bookingId) {
      this.router.navigate(['/customer/bookings', this.bookingId]);
    } else {
      this.router.navigate(['/customer/bookings']);
    }
  }

  onContinueShopping() {
    if (this.bookingTimer) clearTimeout(this.bookingTimer);
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
