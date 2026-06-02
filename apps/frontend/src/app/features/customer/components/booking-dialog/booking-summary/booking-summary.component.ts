import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';
import { FormatDurationPipe } from '../../../../../shared/pipes/format-duration.pipe';
import { SelectedService } from '../service-selector/service-selector.component';

@Component({
  selector: 'app-booking-summary',
  standalone: true,
  imports: [CommonModule, FormatPricePipe, FormatDurationPipe],
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.scss'],
})
export class BookingSummaryComponent {
  @Input() selected: SelectedService[] = [];
  @Input() selectedDateTime = '';
  @Output() editServices = new EventEmitter<void>();
  @Output() editTime = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  loading = false;

  getTotalPrice(): number {
    return this.selected.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  }

  getTotalDuration(): number {
    return this.selected.reduce((sum, item) => sum + item.service.durationMinutes * item.quantity, 0);
  }

  formatDateTime(): string {
    if (!this.selectedDateTime) return '';
    const dt = new Date(this.selectedDateTime);
    return dt.toLocaleString();
  }

  onEditServices() {
    this.editServices.emit();
  }

  onEditTime() {
    this.editTime.emit();
  }

  onConfirm() {
    this.loading = true;
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  setLoading(val: boolean) {
    this.loading = val;
  }
}
