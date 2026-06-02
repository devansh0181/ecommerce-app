import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedService } from '../service-selector/service-selector.component';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, FormatPricePipe],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss'],
})
export class BookingConfirmationComponent {
  @Input() bookingId = '';
  @Input() selected: SelectedService[] = [];
  @Input() selectedDateTime = '';
  @Input() salonName = '';
  @Output() viewDetails = new EventEmitter<void>();
  @Output() continueShopping = new EventEmitter<void>();

  copied = false;

  getTotalPrice(): number {
    return this.selected.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  }

  copyBookingId() {
    if (navigator.clipboard && this.bookingId) {
      navigator.clipboard.writeText(this.bookingId);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }
  }

  formatDateTime(): string {
    if (!this.selectedDateTime) return '';
    const dt = new Date(this.selectedDateTime);
    return dt.toLocaleString();
  }

  onViewDetails() {
    this.viewDetails.emit();
  }

  onContinueShopping() {
    this.continueShopping.emit();
  }
}
